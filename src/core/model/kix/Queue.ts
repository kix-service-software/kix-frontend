import { TicketStats, Ticket } from "./ticket";
import { KIXObject } from "./KIXObject";
import { KIXObjectType } from "./KIXObjectType";

export class Queue extends KIXObject<Queue> {

    public KIXObjectType: KIXObjectType = KIXObjectType.QUEUE;

    public ObjectId: string | number;
    public QueueID: number;
    public FollowUpID: number;
    public DefaultSignKey: string;
    public Comment: string;
    public ValidID: number;
    public SystemAddressID: number;
    public Name: string;
    public UnlockTimeout: number;
    public Calendar: string;
    public Email: string;
    public GroupID: number;
    public SalutationID: number;
    public RealName: string;
    public FollowUpLock: number;
    public SignatureID: number;
    public FirstResponseTime: number;
    public FirstResponseNotify: number;
    public UpdateTime: number;
    public UpdateNotify: number;
    public SolutionTime: number;
    public SolutionNotify: number;
    public CreateTime: string;
    public ChangeTime: string;
    public SubQueues: Queue[];
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
            this.Email = queue.Email;
            this.GroupID = queue.GroupID;
            this.SalutationID = queue.SalutationID;
            this.RealName = queue.RealName;
            this.FollowUpLock = queue.FollowUpID;
            this.SignatureID = queue.SignatureID;
            this.FirstResponseTime = queue.FirstResponseTime;
            this.FirstResponseNotify = queue.FirstResponseNotify;
            this.UpdateTime = queue.UpdateTime;
            this.UpdateNotify = queue.UpdateNotify;
            this.SolutionTime = queue.SolutionTime;
            this.SolutionNotify = queue.SolutionNotify;
            this.CreateTime = queue.CreateTime;
            this.ChangeTime = queue.ChangeTime;

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
