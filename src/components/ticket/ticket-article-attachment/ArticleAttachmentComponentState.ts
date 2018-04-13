import { Attachment, Article, ObjectIcon } from '@kix/core/dist/model';

export class ArticleAttachmentComponentState {

    public constructor(
        public article: Article = null,
        public attachment: Attachment = null,
        public progress: boolean = false,
        public extension: string = null,
        public icon: ObjectIcon = null
    ) { }

}
