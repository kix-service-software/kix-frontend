/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BackendNotificationEvent } from './BackendNotificationEvent';

export class BackendNotification {

    public RequestID: string;
    public Namespace: string;
    public ObjectID: string;
    public Timestamp: string;
    public Event: BackendNotificationEvent;
    public ObjectType: string;
    public UserID: number;
    public Data: Object;

    public constructor(notification?: BackendNotification) {
        if (notification) {
            this.Event = notification.Event;
            this.Namespace = notification.Namespace;
            this.ObjectID = notification.ObjectID;
            this.Timestamp = notification.Timestamp;
            this.RequestID = notification.RequestID;
            this.ObjectType = notification.ObjectType;
            this.UserID = Number(notification.UserID);
            this.Data = notification.Data;
        }
    }
}
