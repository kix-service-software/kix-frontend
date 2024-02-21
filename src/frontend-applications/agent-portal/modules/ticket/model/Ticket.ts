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
import { Article } from './Article';
import { TicketHistory } from './TicketHistory';
import { SortUtil } from '../../../model/SortUtil';
import { ArticleProperty } from './ArticleProperty';
import { DataType } from '../../../model/DataType';
import { SortOrder } from '../../../model/SortOrder';
import { Watcher } from './Watcher';
import { Link } from '../../links/model/Link';
import { SearchOperator } from '../../search/model/SearchOperator';
import { InputFieldTypes } from '../../base-components/webapp/core/InputFieldTypes';
import { TicketProperty } from './TicketProperty';
import { FilterDataType } from '../../../model/FilterDataType';
import { Contact } from '../../customer/model/Contact';
import { TicketLock } from './TicketLock';
import { Organisation } from '../../customer/model/Organisation';
import { User } from '../../user/model/User';
import { TicketPriority } from './TicketPriority';
import { Queue } from './Queue';
import { TicketState } from './TicketState';
import { TicketType } from './TicketType';

export class Ticket extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET;

    public TicketNumber: string;

    public Title: string;

    public TicketID: number;

    public Created: string;

    public CreateTimeUnix: number;

    public CreateBy: number;

    public Changed: string;

    public ChangeBy: number;

    public ArchiveFlag: string;

    public PendingTime: string;

    public PendingTimeUnix: number;

    public Unseen: number;

    public WatcherID: number;

    // Object References

    public StateType: string;

    public StateID: number;

    public PriorityID: number;

    public LockID: number;

    public QueueID: number;

    public OrganisationID: number;

    public ContactID: number;

    public OwnerID: number;

    public TypeID: number;

    public ResponsibleID: number;

    public Articles: Article[];

    public History: TicketHistory[];

    public Watchers: Watcher[];

    // refrenced objects
    public Contact: Contact;
    public TicketLock: TicketLock;
    public Organisation: Organisation;
    public Owner: User;
    public Priority: TicketPriority;
    public Queue: Queue;
    public Responsible: User;
    public State: TicketState;
    public Type: TicketType;

    public constructor(ticket?: Ticket) {
        super(ticket);

        if (ticket) {
            this.TicketID = Number(ticket.TicketID) || null;

            this.ObjectId = this.TicketID;
            this.Unseen = Number(ticket.Unseen);
            this.WatcherID = Number(ticket.WatcherID);
            this.Articles = ticket.Articles
                ? ticket.Articles.map((a) => new Article(a, this))
                : [];

            this.Links = ticket.Links
                ? ticket.Links.map((l) => new Link(l))
                : [];

            this.History = ticket.History
                ? ticket.History.map((th) => new TicketHistory(th))
                : [];

            this.History.sort((a, b) => b.HistoryID - a.HistoryID);

            if (isNaN(ticket.ContactID)) {
                const object = ticket.ContactID as any;
                this.Contact = new Contact(object);
                this.ContactID = object?.ID;
            }

            if (isNaN(ticket.LockID)) {
                const object = ticket.LockID as any;
                this.TicketLock = new TicketLock(object);
                this.LockID = object?.ID;
            }

            if (isNaN(ticket.OrganisationID)) {
                const object = ticket.OrganisationID as any;
                this.Organisation = new Organisation(object);
                this.OrganisationID = object?.ID;
            }

            if (isNaN(ticket.OwnerID)) {
                const object = ticket.OwnerID as any;
                this.Owner = new User(object);
                this.OwnerID = object?.UserID;
            }

            if (isNaN(ticket.PriorityID)) {
                const object = ticket.PriorityID as any;
                this.Priority = new TicketPriority(object);
                this.PriorityID = object?.ID;
            }

            if (isNaN(ticket.QueueID)) {
                const object = ticket.QueueID as any;
                this.Queue = new Queue(object);
                this.QueueID = object?.ID;
            }

            if (isNaN(ticket.ResponsibleID)) {
                const object = ticket.ResponsibleID as any;
                this.Responsible = new User(object);
                this.ResponsibleID = object?.UserID;
            }

            if (isNaN(ticket.StateID)) {
                const object = ticket.StateID as any;
                this.State = new TicketState(object);
                this.StateID = object?.ID;
            }

            if (isNaN(ticket.TypeID)) {
                const object = ticket.TypeID as any;
                this.Type = new TicketType(object);
                this.TypeID = object?.ID;
            }

            this.CreateTime = ticket.Created;
            this.ChangeTime = ticket.Changed;
        } else {
            this.TicketNumber = null;
            this.Title = null;
            this.TicketID = null;
            this.Created = null;
            this.CreateTimeUnix = null;
            this.CreateBy = null;
            this.Changed = null;
            this.ChangeBy = null;
            this.ArchiveFlag = null;
            this.PendingTime = null;
            this.PendingTimeUnix = null;
            this.Unseen = null;
            this.StateType = null;
            this.StateID = null;
            this.PriorityID = null;
            this.LockID = null;
            this.QueueID = null;
            this.OrganisationID = null;
            this.ContactID = null;
            this.OwnerID = null;
            this.TypeID = null;
            this.ResponsibleID = null;
            this.Articles = [];
            this.History = null;
            this.Watchers = null;
            this.Contact = null;
            this.TicketLock = null;
            this.Organisation = null;
            this.Owner = null;
            this.Priority = null;
            this.Queue = null;
            this.Responsible = null;
            this.State = null;
            this.Type = null;
        }

    }

    public isPendingReached(): boolean {
        const untilTime = this.getUntilTime();
        return untilTime && untilTime <= 0;
    }

    public getFirstArticle(): Article {
        if (this.Articles && this.Articles.length) {
            const sortedArticles = SortUtil.sortObjects(
                this.Articles, ArticleProperty.ARTICLE_ID, DataType.NUMBER, SortOrder.UP
            );
            return sortedArticles[0];
        }

        return null;
    }

    public getUntilTime(): number {
        let untilTime;
        if (this.PendingTimeUnix && !isNaN(Number(this.PendingTimeUnix)) && this.PendingTimeUnix !== 0) {
            untilTime = this.PendingTimeUnix - Math.floor(Date.now() / 1000);
        }
        return untilTime;
    }

    public equals(ticket: Ticket): boolean {
        return this.TicketID === ticket.TicketID;
    }

    public getIdPropertyName(): string {
        return 'TicketID';
    }

    private static NUMBER_OPERATORS = [
        SearchOperator.EQUALS,
        SearchOperator.NOT_EQUALS,
        SearchOperator.LESS_THAN,
        SearchOperator.GREATER_THAN,
        SearchOperator.LESS_THAN_OR_EQUAL,
        SearchOperator.GREATER_THAN_OR_EQUAL,
        SearchOperator.BETWEEN
    ];

    private static NUMBER_OPERATORS_EXTENDED = [
        ...Ticket.NUMBER_OPERATORS,
        SearchOperator.IN,
        SearchOperator.NOT_IN
    ];

    private static DATETIME_OPERATORS = [
        SearchOperator.LESS_THAN,
        SearchOperator.GREATER_THAN,
        SearchOperator.LESS_THAN_OR_EQUAL,
        SearchOperator.GREATER_THAN_OR_EQUAL,
        SearchOperator.BETWEEN,
        SearchOperator.WITHIN_THE_LAST,
        SearchOperator.WITHIN_THE_NEXT,
        SearchOperator.WITHIN,
        SearchOperator.MORE_THAN_AGO,
        SearchOperator.IN_MORE_THAN,
        SearchOperator.LESS_THAN_AGO,
        SearchOperator.IN_LESS_THAN
    ];

    private static STRING_OPERATORS = [
        SearchOperator.EQUALS,
        SearchOperator.NOT_EQUALS,
        SearchOperator.CONTAINS,
        SearchOperator.STARTS_WITH,
        SearchOperator.ENDS_WITH,
        SearchOperator.LIKE
    ];

    private static STRING_OPERATORS_EXTENDED = [
        ...Ticket.STRING_OPERATORS,
        SearchOperator.IN,
        SearchOperator.NOT_IN
    ];


    // TODO: allow all possible (in backend) Operators for attributes - managers should limit
    public static SEARCH_PROPERTIES = [
        {
            Property: TicketProperty.TICKET_ID,
            Operations: Ticket.NUMBER_OPERATORS,
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.NUMBER
        },
        {
            Property: TicketProperty.ARTICLE_CREATE_TIME,
            Operations: Ticket.DATETIME_OPERATORS,
            DataType: FilterDataType.DATETIME,
            InputType: InputFieldTypes.DATE_TIME
        },
        {
            Property: TicketProperty.ATTACHMENT_NAME,
            Operations: Ticket.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: ArticleProperty.BODY,
            Operations: Ticket.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: ArticleProperty.CC,
            Operations: Ticket.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        // {
        //     Property: TicketProperty.CHANGE_TIME,     // use LAST_CHANGE_TIME if needed, CHANGE_TIME uses history
        //     Operations: Ticket.DATETIME_OPERATORS,
        //     DataType: FilterDataType.DATETIME,
        //     InputType: InputFieldTypes.DATE_TIME
        // },
        {
            Property: TicketProperty.CLOSE_TIME,
            Operations: Ticket.DATETIME_OPERATORS,
            DataType: FilterDataType.DATETIME,
            InputType: InputFieldTypes.DATE_TIME
        },
        {
            Property: TicketProperty.CONTACT_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.STRING_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.OBJECT_REFERENCE
        },
        {
            Property: TicketProperty.CREATED_PRIORITY_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: TicketProperty.CREATED_QUEUE_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: TicketProperty.CREATED_STATE_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: TicketProperty.CREATED_TYPE_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: TicketProperty.CREATE_TIME,
            Operations: Ticket.DATETIME_OPERATORS,
            DataType: FilterDataType.DATETIME,
            InputType: InputFieldTypes.DATE_TIME
        },
        {
            Property: ArticleProperty.FROM,
            Operations: Ticket.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: TicketProperty.LAST_CHANGE_TIME,
            Operations: Ticket.DATETIME_OPERATORS,
            DataType: FilterDataType.DATETIME,
            InputType: InputFieldTypes.DATE_TIME
        },
        {
            Property: TicketProperty.LOCK_ID,
            Operations: [SearchOperator.EQUALS],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: TicketProperty.ORGANISATION_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.STRING_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.OBJECT_REFERENCE
        },
        {
            Property: TicketProperty.OWNER_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.OBJECT_REFERENCE
        },
        {
            Property: TicketProperty.PENDING_TIME,
            Operations: Ticket.DATETIME_OPERATORS,
            DataType: FilterDataType.DATETIME,
            InputType: InputFieldTypes.DATE_TIME
        },
        {
            Property: TicketProperty.PRIORITY_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: TicketProperty.QUEUE_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: TicketProperty.RESPONSIBLE_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.OBJECT_REFERENCE
        },
        {
            Property: TicketProperty.STATE_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: TicketProperty.STATE_TYPE,
            Operations: [SearchOperator.IN],
            APIOperations: [SearchOperator.IN, SearchOperator.EQUALS],
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: TicketProperty.STATE_TYPE_ID,
            Operations: [SearchOperator.IN],
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: ArticleProperty.SUBJECT,
            Operations: Ticket.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: TicketProperty.TICKET_NUMBER,
            Operations: Ticket.STRING_OPERATORS,
            APIOperations: Ticket.STRING_OPERATORS_EXTENDED,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: TicketProperty.TITLE,
            Operations: Ticket.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: ArticleProperty.TO,
            Operations: Ticket.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: TicketProperty.TYPE_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: TicketProperty.WATCHER_USER_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.OBJECT_REFERENCE
        },
        {
            Property: ArticleProperty.CHANNEL_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: ArticleProperty.SENDER_TYPE_ID,
            Operations: [SearchOperator.IN, SearchOperator.NOT_IN],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        },
        {
            Property: ArticleProperty.CUSTOMER_VISIBLE,
            Operations: [SearchOperator.EQUALS, SearchOperator.NOT_EQUALS],
            APIOperations: Ticket.NUMBER_OPERATORS_EXTENDED,
            DataType: FilterDataType.NUMERIC,
            InputType: InputFieldTypes.DROPDOWN
        }
    ];
}
