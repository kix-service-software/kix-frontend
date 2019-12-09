/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from "../../../frontend-applications/agent-portal/server/socket-namespaces/SocketNameSpace";
import {
    SocketResponse
} from "../../../frontend-applications/agent-portal/modules/base-components/webapp/core/SocketResponse";
import {
    ISocketResponse
} from "../../../frontend-applications/agent-portal/modules/base-components/webapp/core/ISocketResponse";

export class ChatNamespace extends SocketNameSpace {

    private static INSTANCE: ChatNamespace;

    public static getInstance(): ChatNamespace {
        if (!ChatNamespace.INSTANCE) {
            ChatNamespace.INSTANCE = new ChatNamespace();
        }
        return ChatNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'chat';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, 'SEND_MESSAGE', this.sendMessage.bind(this));
        return;
    }

    private async sendMessage(data): Promise<SocketResponse> {
        this.broadcast(data);
        return new SocketResponse<ISocketResponse>('FINISHED');
    }

    public broadcast(data): void {
        if (this.namespace) {
            this.namespace.emit('CHAT_MESSAGE', data);
        }
    }

}
