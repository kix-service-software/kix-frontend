import { CreateAttachment } from './CreateAttachment';

export class CreateArticleAttachmentRequest {

    public Attachment: CreateAttachment;

    public constructor(createAttachment: CreateAttachment) {
        this.Attachment = createAttachment;
    }

}
