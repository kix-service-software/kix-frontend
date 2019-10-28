/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../KIXObject';
import { ArticleFlag } from './ArticleFlag';
import { ArticleReceiver } from './ArticleReceiver';
import { SenderType } from './SenderType';
import { KIXObjectType } from '..';
import { DynamicField } from '../dynamic-field';
import { Attachment } from '../Attachment';

export class Article extends KIXObject<Article> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.ARTICLE;

    public TicketID: number;

    public ArticleID: number;

    public From: string;

    public FromRealname: string;

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

    public SenderType: string;

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

    public CreatedBy: number;
    public ChangedBy: number;

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
            this.FromRealname = article.FromRealname;
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
            this.SenderType = article.SenderType;
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
            this.ChangeTime = article.ChangeTime;
            this.CreateTime = article.CreateTime;
            this.ChangedBy = article.ChangedBy;
            this.CreatedBy = article.CreatedBy;

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
            return this.Flags.some((af) => af.Name.toLocaleLowerCase() === 'notsenterror');
        }
        return false;
    }

    public getUnsentError(): string {
        const flag = this.Flags.find((af) => af.Name.toLocaleLowerCase() === 'notsenterror');
        if (flag) {
            return flag.Value;
        }
        return '';
    }

    public equals(article: Article): boolean {
        return this.ArticleID === article.ArticleID;
    }

    public getIdPropertyName(): string {
        return 'ArticleID';
    }
}
