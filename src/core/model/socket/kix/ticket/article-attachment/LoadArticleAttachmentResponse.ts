import { Attachment } from "../../../../kix";

export class LoadArticleAttachmentResponse {

    public constructor(public requestId: string, public attachment: Attachment) { }

}
