export class Attachment {

    public ID: number;

    public ContentAlternative: string;

    public ContentID: string;

    public ContentType: string;

    public Filename: string;

    public Filesize: string;

    public FilesizeRaw: number;

    public Content: string;

    public Disposition: string;

    public constructor(attachment?: Attachment) {
        if (attachment) {
            this.ID = attachment.ID;
            this.ContentAlternative = attachment.ContentAlternative;
            this.ContentID = attachment.ContentID;
            this.ContentType = attachment.ContentType;
            this.Filename = attachment.Filename;
            this.Filesize = attachment.Filesize;
            this.FilesizeRaw = attachment.FilesizeRaw;
            this.Content = attachment.Content;
            this.Disposition = attachment.Disposition;
        }
    }

}
