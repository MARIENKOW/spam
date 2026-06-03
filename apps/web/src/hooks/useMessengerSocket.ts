"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { MessengerNewMessageEvent } from "@myorg/shared/dto";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_ORIGIN_CLIENT ?? "";

export function useMessengerSocket(
    onNewMessage: (event: MessengerNewMessageEvent) => void,
): void {
    const callbackRef = useRef(onNewMessage);
    callbackRef.current = onNewMessage;

    useEffect(() => {
        const socket = io(`${SOCKET_URL}/messenger`, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        socket.on("message.new", (event: MessengerNewMessageEvent) => {
            callbackRef.current(event);
        });

        return () => {
            socket.disconnect();
        };
    }, []);
}
