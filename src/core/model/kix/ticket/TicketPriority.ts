import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class TicketPriority extends KIXObject<TicketPriority> {

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET_PRIORITY;

    public ObjectId: number;

    public ID: number;

    public Name: string;

    public ChangeTime: string;

    public CreateTime: string;

    public ValidID: number;

    public ChangeBy: number;

    public CreateBy: number;

    public Comment: string;

    public constructor(priority?: TicketPriority) {
        super();
        if (priority) {
            this.ID = Number(priority.ID);
            this.ObjectId = this.ID;
            this.Name = priority.Name;
            this.ChangeBy = priority.ChangeBy;
            this.ChangeTime = priority.ChangeTime;
            this.CreateBy = priority.CreateBy;
            this.CreateTime = priority.CreateTime;
            this.ValidID = priority.ValidID;
            this.Comment = priority.Comment;
        }
    }

    public equals(priority: TicketPriority): boolean {
        return this.ID === priority.ID;
    }


}
