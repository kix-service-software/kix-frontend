/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    SocketClient
} from "../../../../frontend-applications/agent-portal/modules/base-components/webapp/core/SocketClient";

export class ChatSocketClient extends SocketClient {

    public static getInstance(): ChatSocketClient {
        if (!ChatSocketClient.INSTANCE) {
            ChatSocketClient.INSTANCE = new ChatSocketClient();
        }

        return ChatSocketClient.INSTANCE;
    }

    private static INSTANCE: ChatSocketClient = null;

    private listener: Array<(message: string, chatId: string) => void> = [];

    public constructor() {
        super();
        this.socket = this.createSocket('chat', true);

        this.socket.on('CHAT_MESSAGE', (data) => {
            this.listener.forEach((l) => l(data.message, data.chatId));
        });
    }

    public register(listener: (message: string, chatId: string) => void): void {
        this.listener.push(listener);
    }

    public send(message: string, chatId: string): void {
        this.socket.emit('SEND_MESSAGE', { message, chatId });
    }



}
