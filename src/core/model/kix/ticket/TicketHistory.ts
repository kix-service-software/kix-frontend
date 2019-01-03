import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "..";

export class TicketHistory extends KIXObject<TicketHistory> {

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
        super();
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
