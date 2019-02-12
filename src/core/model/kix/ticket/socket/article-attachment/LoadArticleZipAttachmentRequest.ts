export class LoadArticleZipAttachmentRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public ticketId: number,
        public articleId: number
    ) { }

}
