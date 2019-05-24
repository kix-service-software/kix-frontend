import { KIXObject } from "./../KIXObject";
import { KIXObjectType } from "./../KIXObjectType";

export class MailAccount extends KIXObject {

    public KIXObjectType: KIXObjectType;

    public ObjectId: string | number;

    public ID: string | number;
    public Host: string;
    public Login: string;
    public Type: string;
    public IMAPFolder: string;
    public Trusted: number;
    public DispachtingBy: string;
    public QueueID: number;
    public Comment: string;

    public constructor(mailAccount?: MailAccount) {
        super();
        if (mailAccount) {
            this.ID = mailAccount.ID;
            this.ObjectId = this.ID;
            this.ChangeBy = mailAccount.ChangeBy;
            this.ChangeTime = mailAccount.ChangeTime;
            this.CreateBy = mailAccount.CreateBy;
            this.CreateTime = mailAccount.CreateTime;
            this.Comment = mailAccount.Comment;
            this.ValidID = mailAccount.ValidID;
            this.Host = mailAccount.Host;
            this.Login = mailAccount.Login;
            this.Type = mailAccount.Type;
            this.IMAPFolder = mailAccount.IMAPFolder;
            this.Trusted = mailAccount.Trusted;
            this.DispachtingBy = mailAccount.DispachtingBy;
            this.QueueID = mailAccount.QueueID;
        }
    }

    public equals(mailAccount: MailAccount): boolean {
        return this.ID === mailAccount.ID;
    }

}
