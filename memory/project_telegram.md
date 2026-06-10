---
name: project-telegram
description: Архитектура и механика Telegram-интеграции в проекте spam — модули, рассылки, аутентификация, Worker
metadata:
  type: project
---

## Telegram-интеграция: обзор

Проект — спам-платформа с MTProto-аккаунтами и рассылками через Star Gifts API.

### Модули

- **`tg-account`** — аутентификация TG-аккаунтов (SMS + QR, GramJS), хранение sessionString в БД
- **`tg-client-manager`** — глобальный реестр активных GramJS-подключений; восстанавливает все сессии при старте
- **`broadcast`** — управление рассылками (каналы, получатели, Worker)
- **`tg-messenger`** — просмотр диалогов + отправка (REST + Socket.IO WebSocket)

### Аутентификация аккаунтов

- SMS: `authStart` → `authVerify` (+ 2FA пароль)
- QR: `qrStart` → `qrPoll` (long-polling, TTL 10 мин) → `qrVerify2fa`
- После входа сессия регистрируется в `TgClientManagerService`; дубли (тот же аккаунт у другого админа) инвалидируются
- Каждые 1 мин очищаются истёкшие сессии

### Механика рассылок

1. Добавить канал → фоновая загрузка получателей через `Api.payments.GetSavedStarGifts` (Star Gifts API)
2. Анонимные дары (`nameHidden`) пропускаются
3. `start()` → `BroadcastWorker` (setTimeout-очередь в памяти)
4. Задержка ~3-4 мин между сообщениями (base 3 мин + random jitter до 1 мин)
5. Flood-wait: при ошибке ждёт указанное время + 2 сек буфер
6. Статусы: DRAFT → RUNNING → COMPLETED / STOPPED
7. `reset()` архивирует текущий цикл в `BroadcastRun` со снимком статистики

### Ограничения архитектуры

- **Один broadcast на аккаунт** — связь 1:1 в Prisma
- **Worker в памяти (setTimeout)** — нет Bull/BullMQ; при падении процесса текущий получатель зависает в PENDING; RUNNING-рассылки подхватываются из БД при рестарте
- **Источник аудитории** — исключительно Star Gifts (не подписчики канала)

### Prisma-модели

- `TgAccount` — аккаунт, sessionString, статус (ACTIVE/INACTIVE/BANNED)
- `Broadcast` — рассылка (1 на аккаунт)
- `BroadcastChannel` — каналы в рассылке
- `BroadcastRecipient` — получатели (PENDING/SENT/FAILED)
- `BroadcastRun` / `BroadcastRunRecipient` — архив завершённых циклов

### Env-переменные

- `TELEGRAM_API_ID`, `TELEGRAM_API_HASH` — MTProto credentials
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — уведомления

**Why:** Понимание архитектуры нужно для любых задач, связанных с TG-аккаунтами, рассылками, Worker'ом или мессенджером.
**How to apply:** При задачах по tg-account, broadcast, tg-messenger или tg-client-manager — опираться на эту схему как отправную точку.
