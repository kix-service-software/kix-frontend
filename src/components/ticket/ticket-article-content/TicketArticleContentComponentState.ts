import { Article } from '@kix/core/dist/model';

export class TicketArticleContentComponentState {

    public constructor(
        public ticketId: number = null,
        public article: Article = null,
        public isContentHTML: boolean = false,
        public content: string = null
    ) { }
}
