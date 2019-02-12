export class SetArticleSeenFlagRequest {

    public constructor(
        public token: string,
        public ticketId: number,
        public articleId: number
    ) { }
}
