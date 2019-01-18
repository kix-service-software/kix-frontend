import { Article, StateType, TicketHistory, TicketPriority, TicketState, TicketType } from '.';
import { Contact, Customer, Lock, Queue, Service, User, KIXObjectType } from '..';
import { KIXObject } from '../KIXObject';
import { Watcher } from './Watcher';
import { DynamicField } from '../dynamic-field';
import { Sla } from '../sla';
import { SortUtil, SortOrder } from '../../sort';
import { ArticleProperty } from './ArticleProperty';
import { DataType } from '../../DataType';

export class Ticket extends KIXObject<Ticket> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET;

    public TicketNumber: string;

    public Title: string;

    public TicketID: number;

    public StateID: number;

    public PriorityID: number;

    public LockID: number;

    public QueueID: number;

    public CustomerID: string;

    public CustomerUserID: string;

    public OwnerID: number;

    public TypeID: number;

    public SLAID?: number | string;

    public ServiceID?: number;

    public ResponsibleID: number;

    public Age: number;

    public Created: string;

    public CreateTimeUnix: number;

    public CreateBy: number;

    public Changed: string;

    public ChangeBy: number;

    public ArchiveFlag: string;

    public PendingTime: string;

    public TimeUnits: number;

    public EscalationResponseTime: number;

    public EscalationUpdateTime: number;

    public EscalationSolutionTime: number;

    public EscalationDestinationIn: string;

    public EscalationDestinationTime: number;

    public EscalationDestinationDate: string;

    public EscalationTimeWorkingTime: number;

    public EscalationTime: number;

    public FirstResponseTimeEscalation: boolean;

    public FirstResponseTimeNotification: boolean;

    public FirstResponseTimeDestinationTime: number;

    public FirstResponseTimeDestinationDate: string;

    public FirstResponseTimeWorkingTime: number;

    public FirstResponseTime: number;

    public UpdateTimeEscalation: boolean;

    public UpdateTimeNotification: boolean;

    public UpdateTimeDestinationTime: number;

    public UpdateTimeDestinationDate: string;

    public UpdateTimeWorkingTime: number;

    public UpdateTime: number;

    public SolutionTimeEscalation: boolean;

    public SolutionTimeNotification: boolean;

    public SolutionTimeDestinationTime: number;

    public SolutionTimeDestinationDate: string;

    public SolutionTimeWorkingTime: number;

    public SolutionTime: number;

    public DynamicFields: DynamicField[];

    public Articles: Article[];

    public History: TicketHistory[];

    public Watchers: Watcher[];

    public Unseen: number;

    // UI Properties

    public owner: User;
    public priority: TicketPriority;
    public queue: Queue;
    public responsible: User;
    public service: Service;
    public sla: Sla;
    public state: TicketState;
    public stateType: StateType;
    public type: TicketType;
    public customer: Customer;
    public contact: Contact;

    public constructor(ticket?: Ticket) {
        super();
        if (ticket) {
            this.TicketID = Number(ticket.TicketID);
            this.ObjectId = this.TicketID;
            this.TicketNumber = ticket.TicketNumber;
            this.Title = ticket.Title;
            this.StateID = ticket.StateID;
            this.PriorityID = ticket.PriorityID;
            this.LockID = ticket.LockID;
            this.QueueID = ticket.QueueID;
            this.CustomerID = ticket.CustomerID;
            this.CustomerUserID = ticket.CustomerUserID;
            this.OwnerID = ticket.OwnerID;
            this.TypeID = ticket.TypeID;

            this.SLAID = String(ticket.SLAID) === ''
                ? null
                : (ticket.SLAID !== null ? Number(ticket.SLAID) : null);

            this.ServiceID = String(ticket.ServiceID) === ''
                ? null
                : (ticket.ServiceID !== null ? Number(ticket.ServiceID) : null);

            this.ResponsibleID = ticket.ResponsibleID;
            this.Age = ticket.Age;
            this.Created = ticket.Created;
            this.CreateTimeUnix = ticket.CreateTimeUnix;
            this.CreateBy = ticket.CreateBy;
            this.Changed = ticket.Changed;
            this.ChangeBy = ticket.ChangeBy;
            this.ArchiveFlag = ticket.ArchiveFlag;
            this.PendingTime = ticket.PendingTime;
            this.TimeUnits = ticket.TimeUnits;
            this.EscalationResponseTime = ticket.EscalationResponseTime;
            this.EscalationUpdateTime = ticket.EscalationUpdateTime;
            this.EscalationSolutionTime = ticket.EscalationSolutionTime;
            this.EscalationDestinationIn = ticket.EscalationDestinationIn;
            this.EscalationDestinationTime = ticket.EscalationDestinationTime;
            this.EscalationDestinationDate = ticket.EscalationDestinationDate;
            this.EscalationTimeWorkingTime = ticket.EscalationTimeWorkingTime;
            this.EscalationTime = ticket.EscalationTime;
            this.FirstResponseTimeEscalation = ticket.FirstResponseTimeNotification;
            this.FirstResponseTimeNotification = ticket.FirstResponseTimeNotification;
            this.FirstResponseTimeDestinationTime = ticket.FirstResponseTimeDestinationTime;
            this.FirstResponseTimeDestinationDate = ticket.FirstResponseTimeDestinationDate;
            this.FirstResponseTimeWorkingTime = ticket.FirstResponseTimeWorkingTime;
            this.FirstResponseTime = ticket.FirstResponseTime;
            this.UpdateTimeEscalation = ticket.UpdateTimeEscalation;
            this.UpdateTimeNotification = ticket.UpdateTimeNotification;
            this.UpdateTimeDestinationTime = ticket.UpdateTimeDestinationTime;
            this.UpdateTimeDestinationDate = ticket.UpdateTimeDestinationDate;
            this.UpdateTimeWorkingTime = ticket.UpdateTimeWorkingTime;
            this.UpdateTime = ticket.UpdateTime;
            this.SolutionTimeEscalation = ticket.SolutionTimeEscalation;
            this.SolutionTimeNotification = ticket.SolutionTimeNotification;
            this.SolutionTimeDestinationTime = ticket.SolutionTimeDestinationTime;
            this.SolutionTimeDestinationDate = ticket.SolutionTimeDestinationDate;
            this.SolutionTimeWorkingTime = ticket.SolutionTimeWorkingTime;
            this.SolutionTime = ticket.SolutionTime;

            this.LinkTypeName = ticket.LinkTypeName;
            this.Watchers = ticket.Watchers;
            this.Unseen = Number(ticket.Unseen);

            this.owner = ticket.owner;
            this.priority = ticket.priority;
            this.queue = ticket.queue;
            this.responsible = ticket.responsible;
            this.service = ticket.service;
            this.sla = ticket.sla;
            this.state = ticket.state;
            this.stateType = ticket.stateType;
            this.type = ticket.type;
            this.customer = ticket.customer;
            this.contact = ticket.contact;

            this.Articles = ticket.Articles;
            this.Links = ticket.Links;
            this.DynamicFields = ticket.DynamicFields;
            this.History = ticket.History;
        }

    }

    public isPendingReached(): boolean {
        const pendingTimeInMillis = Date.parse(this.PendingTime);
        const now = Date.now();
        return now > pendingTimeInMillis;
    }

    public getFirstArticle(): Article {
        if (this.Articles && this.Articles.length) {
            const sortedArticles = SortUtil.sortObjects(
                this.Articles, ArticleProperty.ARTICLE_ID, DataType.NUMBER, SortOrder.DOWN
            );
            return sortedArticles[sortedArticles.length - 1];
        }

        return null;
    }

    public equals(ticket: Ticket): boolean {
        return this.TicketID === ticket.TicketID;
    }

    public getIdPropertyName(): string {
        return 'TicketID';
    }
}
