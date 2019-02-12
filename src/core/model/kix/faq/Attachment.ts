import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class Attachment extends KIXObject<Attachment> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE_ATTACHMENT;

    public ID: number;
    public ArticleID: number;
    public Content: string;
    public ContentID: string;
    public ContentType: string;
    public Disposition: string;
    public Filename: string;
    public Filesize: string;
    public FilesizeRaw: number;
    public Inline: number;
    public CreateBy: number;
    public CreateTime: string;
    public ChangeBy: number;
    public ChangeTime: string;

    public constructor(attachment?: Attachment) {
        super();
        if (attachment) {
            this.ID = attachment.ID;
            this.ObjectId = this.ID;
            this.ArticleID = attachment.ArticleID;
            this.Content = attachment.Content;
            this.ContentID = attachment.ContentID;
            this.ContentType = attachment.ContentType;
            this.Disposition = attachment.Disposition;
            this.Filename = attachment.Filename;
            this.Filesize = attachment.Filesize;
            this.FilesizeRaw = Number(attachment.FilesizeRaw);
            this.Inline = attachment.Inline;
            this.CreateBy = attachment.CreateBy;
            this.CreateTime = attachment.CreateTime;
            this.ChangeBy = attachment.ChangeBy;
            this.ChangeTime = attachment.ChangeTime;
        }
    }

    public equals(attachment: Attachment): boolean {
        return this.ID === attachment.ID;
    }




}
