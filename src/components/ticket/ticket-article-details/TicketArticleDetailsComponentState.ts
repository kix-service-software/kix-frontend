import { Article, Ticket } from '../../../core/model';

export class TicketArticleDetailsComponentState {

    public constructor(
        public inputObject: Ticket | Article = null,
        public article: Article = null,
        public loading: boolean = true
    ) { }

}
