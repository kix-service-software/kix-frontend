export class LoadArticleAttachmentRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public ticketId: number,
        public articleId: number,
        public attachmentId: number
    ) { }

}
