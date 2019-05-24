import { TicketStats, Ticket } from "./../ticket";
import { KIXObject } from "./../KIXObject";
import { KIXObjectType } from "./../KIXObjectType";

export class Queue extends KIXObject<Queue> {

    public KIXObjectType: KIXObjectType = KIXObjectType.QUEUE;

    public ObjectId: string | number;
    public QueueID: number;
    public Calendar: string;
    public ChangeTime: string;
    public ChangeBy: number;
    public Comment: string;
    public CreateTime: string;
    public CreateBy: number;
    public DefaultSignKey: string;
    public FirstResponseNotify: number;
    public FirstResponseTime: number;
    public FollowUpID: number;
    public FollowUpLock: number;
    public Fullname: string;
    public Name: string;
    public ParentID: number | string;
    public Signature: string;
    public SolutionNotify: number;
    public SolutionTime: number;
    public SubQueues: Queue[];
    public SystemAddressID: number;
    public UnlockTimeout: number;
    public UpdateNotify: number;
    public UpdateTime: number;
    public ValidID: number;

    public TicketStats: TicketStats;
    public Tickets: number[] | Ticket[];

    public constructor(queue?: Queue) {
        super();
        if (queue) {
            this.QueueID = Number(queue.QueueID);
            this.ObjectId = this.QueueID;
            this.FollowUpID = queue.FollowUpID;
            this.DefaultSignKey = queue.DefaultSignKey;
            this.Comment = queue.Comment;
            this.ValidID = queue.ValidID;
            this.SystemAddressID = queue.SystemAddressID;
            this.Name = queue.Name;
            this.UnlockTimeout = queue.UnlockTimeout;
            this.Calendar = queue.Calendar;
            this.Fullname = queue.Fullname;
            this.FollowUpLock = queue.FollowUpLock;
            this.Signature = queue.Signature;
            this.FirstResponseTime = queue.FirstResponseTime;
            this.FirstResponseNotify = queue.FirstResponseNotify;
            this.UpdateTime = queue.UpdateTime;
            this.UpdateNotify = queue.UpdateNotify;
            this.SolutionTime = queue.SolutionTime;
            this.SolutionNotify = queue.SolutionNotify;
            this.CreateTime = queue.CreateTime;
            this.ChangeTime = queue.ChangeTime;
            this.CreateBy = queue.CreateBy;
            this.ChangeBy = queue.ChangeBy;
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

}
