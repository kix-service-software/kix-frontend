import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class ConfigItemAttachment extends KIXObject<ConfigItemAttachment> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_ATTACHMENT;

    public ID: number;

    public AttachmentID: number;

    public Filesize: string;

    public FilesizeRaw: number;

    public Filename: string;

    public ContentType: string;

    public Content: string;

    public constructor(attachment?: ConfigItemAttachment) {
        super();
        if (attachment) {
            this.ID = attachment.ID ? Number(attachment.ID) : Number(attachment.AttachmentID);
            this.ObjectId = this.ID;
            this.AttachmentID = this.ID;
            this.Filesize = attachment.Filesize;
            this.FilesizeRaw = attachment.FilesizeRaw;
            this.Filename = attachment.Filename;
            this.ContentType = attachment.ContentType;
            this.Content = attachment.Content;
        }
    }

    public equals(attachment: ConfigItemAttachment): boolean {
        return attachment.ID === this.ID;
    }

}
