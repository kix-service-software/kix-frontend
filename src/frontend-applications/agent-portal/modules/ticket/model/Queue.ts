/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { TicketStats } from './TicketStats';
import { Ticket } from './Ticket';

export class Queue extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.QUEUE;

    public ObjectId: string | number;
    public QueueID: number;
    public DefaultSignKey: string;
    public FollowUpID: number;
    public FollowUpLock: number;
    public Fullname: string;
    public Name: string;
    public ParentID: number;
    public Signature: string;
    public SubQueues: Queue[];
    public SystemAddressID: number;
    public UnlockTimeout: number;

    public TicketStats: TicketStats;
    public Tickets: number[] | Ticket[];

    public constructor(queue?: Queue) {
        super(queue);
        if (queue) {
            this.QueueID = Number(queue.QueueID);
            this.ObjectId = this.QueueID;
            this.FollowUpID = queue.FollowUpID;
            this.DefaultSignKey = queue.DefaultSignKey;
            this.SystemAddressID = queue.SystemAddressID;
            this.Name = queue.Name;
            this.UnlockTimeout = queue.UnlockTimeout;
            this.Fullname = queue.Fullname;
            this.FollowUpLock = queue.FollowUpLock;
            this.Signature = queue.Signature;
            this.ParentID = queue.ParentID;

            this.SubQueues = queue.SubQueues ? queue.SubQueues.map((q) => new Queue(q)) : [];
            this.TicketStats = new TicketStats(queue.TicketStats);
            this.Tickets = queue.Tickets;
        }
    }

    public equals(queue: Queue): boolean {
        return this.QueueID === queue.QueueID;
    }

    public getIdPropertyName(): string {
        return 'QueueID';
    }

    public toString(): string {
        return this.Name;
    }

}
