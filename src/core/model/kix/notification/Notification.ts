/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class Notification extends KIXObject<Notification> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.NOTIFICATION;

    public Data: {};

    public ID: number;

    public Message: {};

    public Name: string;

    // data properties
    public Filter: Map<string, string[] | number[]>;
    public Events: string[];
    public VisibleForAgent: boolean;
    public VisibleForAgentTooltip: string;
    public Recipients: string[];
    public RecipientAgents: number[];
    public RecipientEmail: string[];
    public RecipientRoles: number[];
    public RecipientSubject: boolean;
    public SendOnOutOfOffice: boolean;
    public OncePerDay: boolean;

    public constructor(notification?: Notification) {
        super(notification);
        if (notification) {
            this.ID = notification.ID;
            this.ObjectId = this.ID;
            this.Name = notification.Name;
            this.Data = notification.Data;
            this.Message = notification.Message;
        }
    }

}
