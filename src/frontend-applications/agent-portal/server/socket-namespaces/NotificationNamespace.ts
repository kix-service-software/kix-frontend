/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from './SocketNameSpace';
import { NotificationEvent } from '../../model/NotificationEvent';
import { Socket } from 'socket.io';

export class NotificationNamespace extends SocketNameSpace {

    private static INSTANCE: NotificationNamespace;

    public static getInstance(): NotificationNamespace {
        if (!NotificationNamespace.INSTANCE) {
            NotificationNamespace.INSTANCE = new NotificationNamespace();
        }
        return NotificationNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'notifications';
    }

    protected registerEvents(client: Socket): void {
        return;
    }

    public broadcast(event: NotificationEvent, content: any): void {
        if (this.namespace) {
            this.namespace.emit(event, content);
        }
    }

}
