"use client";

import {
    useRef,
    useEffect,
    useCallback,
    KeyboardEvent,
    CompositionEvent,
    ClipboardEvent,
} from "react";
import { Box, SxProps, Theme, useTheme } from "@mui/material";
import { StyledTextField } from "@/components/ui/StyledTextField";

interface Props {
    value: string;
    onChange: (value: string) => void;
    /** Вызывается когда все ячейки заполнены */
    onComplete?: (value: string) => void;
    error?: boolean;
    disabled?: boolean;
    length?: number;
    autoFocus?: boolean;
    sx?: SxProps<Theme>;
}

export default function OtpInput({
    value,
    onChange,
    onComplete,
    error,
    disabled,
    length = 6,
    autoFocus = false,
    sx,
}: Props) {
    const theme = useTheme();
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const isComposingRef = useRef(false);
    const backspaceHandledAtRef = useRef<number>(0);
    // Prevents autoFocus effect from fighting with user focus after mount
    const hasAutoFocusedRef = useRef(false);

    const safeValue = value.slice(0, length);
    const digits = Array.from({ length }, (_, i) => safeValue[i] ?? "");

    // ── Утилита фокуса ────────────────────────────────────────────────────────

    const focus = useCallback(
        (idx: number) => {
            const clamped = Math.max(0, Math.min(idx, length - 1));
            const el = inputsRef.current[clamped];
            if (!el) return;
            el.focus();
            // select() нужен чтобы iOS заменял существующую цифру, а не дописывал
            setTimeout(() => el.select(), 0);
        },
        [length],
    );

    // ── Автофокус — только один раз при маунте ────────────────────────────────
    // БАГ БЫЛО: зависимость от `value` означала что effect запускался на каждый
    // keystroke и перебрасывал фокус на первую пустую ячейку (ломало iPhone).

    useEffect(() => {
        if (!autoFocus || hasAutoFocusedRef.current) return;
        hasAutoFocusedRef.current = true;
        const firstEmpty = digits.findIndex((d) => !d);
        focus(firstEmpty === -1 ? length - 1 : firstEmpty);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Emit ──────────────────────────────────────────────────────────────────

    const emit = useCallback(
        (next: string[]) => {
            const val = next.join("");
            if (val === safeValue) return;
            onChange(val);
            if (next.every(Boolean)) {
                // БАГ БЫЛО: blur() убирал фокус с формы → Enter не сабмитил.
                // Теперь фокус остаётся на последней ячейке; onComplete сам решает.
                setTimeout(() => onComplete?.(val), 0);
            }
        },
        [onChange, onComplete, safeValue],
    );

    // ── onChange ──────────────────────────────────────────────────────────────
    // БАГ БЫЛО: `if (raw.length > 1) return` ломал iOS — когда ячейка уже
    // заполнена и выделение не сработало, браузер отдаёт "57" вместо "7".
    // Теперь берём последний валидный символ независимо от длины строки.

    const handleChange = useCallback(
        (idx: number, raw: string) => {
            if (isComposingRef.current) return;

            const char = raw.replace(/\D/g, "").slice(-1);
            const next = [...digits];

            if (!char) {
                next[idx] = "";
                emit(next);
                return;
            }

            next[idx] = char;
            emit(next);
            if (idx < length - 1) focus(idx + 1);
        },
        [digits, emit, focus, length],
    );

    // ── onKeyDown ─────────────────────────────────────────────────────────────

    const handleKeyDown = useCallback(
        (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
            if (isComposingRef.current) return;

            switch (e.key) {
                case "Backspace": {
                    e.preventDefault();
                    backspaceHandledAtRef.current = Date.now();
                    const next = [...digits];
                    if (next[idx]) {
                        next[idx] = "";
                        emit(next);
                    } else if (idx > 0) {
                        next[idx - 1] = "";
                        emit(next);
                        focus(idx - 1);
                    }
                    break;
                }
                case "Delete": {
                    e.preventDefault();
                    const next = [...digits];
                    next[idx] = "";
                    emit(next);
                    break;
                }
                case "ArrowLeft":
                    e.preventDefault();
                    focus(idx - 1);
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    focus(idx + 1);
                    break;
                case "Home":
                    e.preventDefault();
                    focus(0);
                    break;
                case "End":
                    e.preventDefault();
                    focus(length - 1);
                    break;
                case "Tab":
                    break;
                default:
                    if (e.key.length === 1 && !/\d/.test(e.key))
                        e.preventDefault();
            }
        },
        [digits, emit, focus, length],
    );

    // ── Paste — через slotProps.htmlInput напрямую в <input> ──────────────────
    // БАГ БЫЛО: нативный addEventListener вешался в useEffect на рефы.
    // Если рефы менялись между рендерами — слушатели слетали и Ctrl+V переставал
    // работать. React-обработчик в slotProps надёжнее и чище.

    const digitsRef = useRef(digits);
    digitsRef.current = digits;

    const emitRef = useRef(emit);
    emitRef.current = emit;

    const focusRef = useRef(focus);
    focusRef.current = focus;

    const handlePaste = useCallback(
        (idx: number, e: ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            const text = e.clipboardData?.getData("text") ?? "";
            const pasted = text.replace(/\D/g, "").slice(0, length);
            if (!pasted) return;

            const next = [...digitsRef.current];
            pasted.split("").forEach((char, i) => {
                if (idx + i < length) next[idx + i] = char;
            });
            emitRef.current(next);

            const nextEmpty = next.findIndex((d, i) => i >= idx && !d);
            focusRef.current(nextEmpty === -1 ? length - 1 : nextEmpty);
        },
        [length],
    );

    // ── Android backspace fallback ─────────────────────────────────────────────

    const handleInput = useCallback(
        (idx: number, e: React.FormEvent<HTMLDivElement>) => {
            if (
                (e.nativeEvent as InputEvent).inputType !==
                "deleteContentBackward"
            )
                return;
            if (Date.now() - backspaceHandledAtRef.current < 50) return;

            const next = [...digits];
            if (next[idx]) {
                next[idx] = "";
                emit(next);
            } else if (idx > 0) {
                next[idx - 1] = "";
                emit(next);
                focus(idx - 1);
            }
        },
        [digits, emit, focus],
    );

    // ── IME ───────────────────────────────────────────────────────────────────

    const handleCompositionStart = useCallback(() => {
        isComposingRef.current = true;
    }, []);

    const handleCompositionEnd = useCallback(
        (e: CompositionEvent<HTMLInputElement>, idx: number) => {
            isComposingRef.current = false;
            const char = e.data?.replace(/\D/g, "").slice(-1);
            if (char) handleChange(idx, char);
        },
        [handleChange],
    );

    const handleClick = useCallback((idx: number) => {
        inputsRef.current[idx]?.select();
    }, []);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Box
            display="flex"
            gap={{ xs: 0.75, sm: 1 }}
            justifyContent="center"
            role="group"
            aria-label="One-time password input"
            sx={sx}
        >
            {digits.map((digit, idx) => (
                <StyledTextField
                    key={idx}
                    value={digit}
                    inputRef={(el: HTMLInputElement | null) => {
                        inputsRef.current[idx] = el;
                    }}
                    disabled={disabled}
                    error={error}
                    slotProps={{
                        htmlInput: {
                            maxLength: 2, // 2 вместо 1: позволяет iOS прислать "старая+новая" цифра
                            inputMode: "numeric" as const,
                            pattern: "[0-9]*",
                            autoComplete: idx === 0 ? "one-time-code" : "off",
                            "aria-label": `Digit ${idx + 1} of ${length}`,
                            onPaste: (e: ClipboardEvent<HTMLInputElement>) =>
                                handlePaste(idx, e),
                            style: {
                                textAlign: "center" as const,
                                fontSize: theme.typography.h5.fontSize,
                                fontWeight: theme.typography.fontWeightBold,
                                fontFamily: theme.typography.fontFamily,
                                padding: `${theme.spacing(1.5)} 0`,
                                caretColor: "transparent",
                            },
                        },
                    }}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) =>
                        handleKeyDown(idx, e as KeyboardEvent<HTMLInputElement>)
                    }
                    onInput={(e) => handleInput(idx, e)}
                    onFocus={(e) => e.target.select()}
                    onClick={() => handleClick(idx)}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={(e) =>
                        handleCompositionEnd(
                            e as CompositionEvent<HTMLInputElement>,
                            idx,
                        )
                    }
                    sx={{
                        width: {
                            xs: theme.spacing(5.25),
                            sm: theme.spacing(6),
                        },
                        flexShrink: 0,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            transition: theme.transitions.create(
                                [
                                    "box-shadow",
                                    "border-color",
                                    "background-color",
                                ],
                                { duration: theme.transitions.duration.short },
                            ),
                            bgcolor: digit ? "action.hover" : "transparent",
                            "&.Mui-focused": {
                                boxShadow: `0 0 0 3px ${theme.palette.primary.main}33`,
                            },
                            "&.Mui-error": {
                                boxShadow: `0 0 0 3px ${theme.palette.error.main}22`,
                            },
                            "&.Mui-disabled": {
                                bgcolor: "action.disabledBackground",
                            },
                        },
                        "& input::selection": {
                            backgroundColor: "transparent",
                        },
                    }}
                />
            ))}
        </Box>
    );
}
