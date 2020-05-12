/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { Article } from "./Article";
import { TicketHistory } from "./TicketHistory";
import { SortUtil } from "../../../model/SortUtil";
import { ArticleProperty } from "./ArticleProperty";
import { DataType } from "../../../model/DataType";
import { SortOrder } from "../../../model/SortOrder";
import { Watcher } from "./Watcher";
import { Link } from "../../links/model/Link";

export class Ticket extends KIXObject<Ticket> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET;

    public TicketNumber: string;

    public Title: string;

    public TicketID: number;

    public Age: number;

    public Created: string;

    public CreateTimeUnix: number;

    public CreateBy: number;

    public Changed: string;

    public ChangeBy: number;

    public ArchiveFlag: string;

    public PendingTime: string;

    public PendingTimeUnix: number;

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

    public Unseen: number;

    // Object References

    public StateType: string;

    public StateID: number;

    public PriorityID: number;

    public LockID: number;

    public QueueID: number;

    public OrganisationID: string;

    public ContactID: string;

    public OwnerID: number;

    public TypeID: number;

    public ResponsibleID: number;

    public Articles: Article[];

    public History: TicketHistory[];

    public Watchers: Watcher[];

    public constructor(ticket?: Ticket) {
        super(ticket);
        if (ticket) {
            this.TicketID = Number(ticket.TicketID);
            this.ObjectId = this.TicketID;
            this.Unseen = Number(ticket.Unseen);
            this.Articles = ticket.Articles
                ? ticket.Articles.map((a) => new Article(a))
                : [];

            this.Links = ticket.Links
                ? ticket.Links.map((l) => new Link(l))
                : [];

            this.History = ticket.History
                ? ticket.History.map((th) => new TicketHistory(th))
                : [];

            this.History.sort((a, b) => b.HistoryID - a.HistoryID);
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
}
