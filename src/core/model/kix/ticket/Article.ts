import { KIXObject } from '../KIXObject';
import { ArticleFlag } from './ArticleFlag';
import { ArticleReceiver } from './ArticleReceiver';
import { Attachment } from './Attachment';
import { SenderType } from './SenderType';
import { KIXObjectType } from '..';
import { DynamicField } from '../dynamic-field';

export class Article extends KIXObject<Article> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.ARTICLE;

    public TicketID: number;

    public ArticleID: number;

    public From: string;

    public To: string;

    public ToRealname: string;

    public Cc: string;

    public CcRealname: string;

    public Bcc: string;

    public BccRealname: string;

    public Subject: string;

    public Body: string;

    public ReplyTo: string;

    public MessageID: number;

    public InReplyTo: string;

    public References: string;

    public SenderTypeID: number;

    public ChannelID: number;

    public Channel: string;

    public ContentType: string;

    public Charset: string;

    public MimeType: string;

    public IncomingTime: number;

    public DynamicFields: DynamicField[];

    public Attachments: Attachment[];

    public Flags: ArticleFlag[];

    public CustomerVisible: boolean;

    // UI Properties

    public senderType: SenderType;
    public toList: ArticleReceiver[];
    public ccList: ArticleReceiver[];
    public bccList: ArticleReceiver[];
    public bodyAttachment: Attachment = null;

    public constructor(article?: Article) {
        super();

        if (article) {
            this.TicketID = article.TicketID;
            this.ArticleID = article.ArticleID;
            this.ObjectId = this.ArticleID;
            this.From = article.From;
            this.To = article.To;
            this.ToRealname = article.ToRealname;
            this.Cc = article.Cc;
            this.CcRealname = article.CcRealname;
            this.Bcc = article.Bcc;
            this.BccRealname = article.BccRealname;
            this.Subject = article.Subject;
            this.Body = article.Body;
            this.ReplyTo = article.ReplyTo;
            this.MessageID = article.MessageID;
            this.InReplyTo = article.InReplyTo;
            this.References = article.References;
            this.SenderTypeID = article.SenderTypeID;
            this.ContentType = article.ContentType;
            this.Charset = article.Charset;
            this.MimeType = article.MimeType;
            this.IncomingTime = article.IncomingTime;
            this.DynamicFields = article.DynamicFields;
            this.Attachments = article.Attachments;
            this.Flags = article.Flags;
            this.Channel = article.Channel;
            this.ChannelID = article.ChannelID;
            this.CustomerVisible = article.CustomerVisible;

            this.bodyAttachment = article.bodyAttachment;
        }
    }

    public isUnread(): boolean {
        if (this.Flags) {
            return !this.Flags.some((af) => af.Name.toLocaleLowerCase() === 'seen' && af.Value === "1");
        }
        return false;
    }

    public isUnsent(): boolean {
        if (this.Flags) {
            return this.Flags.some((af) => af.Name.toLocaleLowerCase() === 'unsent-error');
        }
        return false;
    }

    public equals(article: Article): boolean {
        return this.ArticleID === article.ArticleID;
    }

    public getIdPropertyName(): string {
        return 'ArticleID';
    }
}
