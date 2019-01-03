import { Attachment } from '../../Attachment';

export class LoadArticleAttachmentResponse {

    public constructor(public requestId: string, public attachment: Attachment) { }

}
