export type MessengerDialogType = "user" | "group" | "channel";

export type MessengerDialogDto = {
    id: string;
    name: string;
    type: MessengerDialogType;
    unreadCount: number;
    lastMessage: string | null;
    lastMessageDate: string | null;
    photoBase64: string | null;
};

export type MessengerAccountDialogsDto = {
    accountId: string;
    accountName: string;
    dialogs: MessengerDialogDto[];
};

export type MessengerMessageDto = {
    id: number;
    text: string;
    date: string;
    fromMe: boolean;
    fromName: string | null;
};

export type MessengerSendDto = {
    accountId: string;
    dialogId: string;
    text: string;
};

export type MessengerNewMessageEvent = {
    accountId: string;
    accountName: string;
    dialogId: string;
    message: MessengerMessageDto;
};
