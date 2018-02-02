import { Attachment } from '@kix/core/dist/model';

export class ArticleAttachmentComponentState {

    public constructor(
        public ticketId: number = null,
        public articleId: number = null,
        public attachment: Attachment = null,
        public progress: boolean = false,
        public extension: string = null
    ) { }

}
