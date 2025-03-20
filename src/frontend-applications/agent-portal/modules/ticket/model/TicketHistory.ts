/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class TicketHistory extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET_HISTORY;

    public HistoryID: number;

    public OwnerID: number;

    public ArticleID: number;

    public CreateBy: number;

    public HistoryType: string;

    public CreateTime: string;

    public StateID: number;

    public TypeID: string;

    public HistoryTypeID: number;

    public Name: string;

    public QueueID: number;

    public TicketID: number;

    public PriorityID: number;

    public constructor(ticketHistory?: TicketHistory) {
        super(ticketHistory);
        if (ticketHistory) {
            this.HistoryID = ticketHistory.HistoryID;
            this.ObjectId = this.HistoryID;
            this.OwnerID = ticketHistory.OwnerID;
            this.ArticleID = ticketHistory.ArticleID;
            this.CreateBy = ticketHistory.CreateBy;
            this.HistoryType = ticketHistory.HistoryType;
            this.CreateTime = ticketHistory.CreateTime;
            this.StateID = ticketHistory.StateID;
            this.TypeID = ticketHistory.TypeID;
            this.HistoryTypeID = ticketHistory.HistoryTypeID;
            this.Name = ticketHistory.Name;
            this.QueueID = ticketHistory.QueueID;
            this.TicketID = ticketHistory.TicketID;
            this.PriorityID = ticketHistory.PriorityID;
        }
    }

    public equals(history: TicketHistory): boolean {
        return this.HistoryID === history.HistoryID;
    }

    public getIdPropertyName(): string {
        return 'HistoryID';
    }

}
