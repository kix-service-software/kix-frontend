/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { Attachment } from '../../../model/kix/Attachment';
import { ArticleFlag } from './ArticleFlag';
import { SenderType } from './SenderType';
import { ArticleReceiver } from './ArticleReceiver';
import { ArticleProperty } from './ArticleProperty';

export class Article extends KIXObject {

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

    public Attachments: Attachment[];

    public Flags: ArticleFlag[];

    public CustomerVisible: boolean;

    public CreatedBy: number;
    public ChangedBy: number;

    public Plain: string;

    // UI Properties

    public senderType: SenderType;
    public toList: ArticleReceiver[];
    public ccList: ArticleReceiver[];
    public bccList: ArticleReceiver[];
    public bodyAttachment: Attachment = null;

    public constructor(article?: Article) {
        super(article);

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
            this.Attachments = article.Attachments;
            this.Flags = article.Flags;
            this.Channel = article.Channel;
            this.ChannelID = article.ChannelID;
            this.CustomerVisible = article.CustomerVisible;
            this.ChangeTime = article.ChangeTime;
            this.CreateTime = article.CreateTime;
            this.ChangedBy = article.ChangedBy;
            this.CreatedBy = article.CreatedBy;
            this.Plain = article.Plain;

            this.bodyAttachment = article.bodyAttachment;

            if (this.Attachments) {
                const bodyAttachmentIndex = article.Attachments.findIndex(
                    (a) => a.Disposition === 'inline' && a.Filename === 'file-2'
                );
                if (bodyAttachmentIndex > -1) {
                    this.bodyAttachment = article.Attachments[bodyAttachmentIndex];
                    this.Attachments.splice(bodyAttachmentIndex, 1);
                }
            }

            this.prepareReceiverLists();
        }
    }

    private prepareReceiverLists(): void {
        const splitRegex = /,\s(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
        let toStringList = [];
        if (!Array.isArray(this.To)) {
            toStringList = this.To ? this.To.split(splitRegex) : [];
        }

        let ccStringList = [];
        if (!Array.isArray(this.Cc)) {
            ccStringList = this.Cc ? this.Cc.split(splitRegex) : [];
        }

        let bccStringList = [];
        if (!Array.isArray(this.Bcc)) {
            bccStringList = this.Bcc ? this.Bcc.split(splitRegex) : [];
        }

        let toRealNameStringList = [];
        if (!Array.isArray(this.ToRealname)) {
            toRealNameStringList = this.ToRealname ? this.ToRealname.split(splitRegex) : [];
        }

        let ccRealNameStringList = [];
        if (!Array.isArray(this.CcRealname)) {
            ccRealNameStringList = this.CcRealname ? this.CcRealname.split(splitRegex) : [];
        }

        let bccRealNameStringList = [];
        if (!Array.isArray(this.BccRealname)) {
            bccRealNameStringList = this.BccRealname ? this.BccRealname.split(splitRegex) : [];
        }

        this.toList = toStringList.map((t, index) => new ArticleReceiver(t, toRealNameStringList[index]));
        this.ccList = ccStringList.map(
            (cc, index) => new ArticleReceiver(cc, ccRealNameStringList[index], ArticleProperty.CC)
        );
        this.bccList = bccStringList.map(
            (bcc, index) => new ArticleReceiver(bcc, bccRealNameStringList[index], ArticleProperty.BCC)
        );
    }

    public isUnread(): boolean {
        if (this.Flags) {
            return !this.Flags.some(
                (af) => typeof af === 'object' && af.Name.toLocaleLowerCase() === 'seen' && af.Value === '1'
            );
        }
        return false;
    }

    public isUnsent(): boolean {
        if (this.Flags) {
            return this.Flags.some((af) => typeof af === 'object' && af.Name.toLocaleLowerCase() === 'notsenterror');
        }
        return false;
    }

    public getUnsentError(): string {
        const flag = this.Flags.find((af) => typeof af === 'object' && af.Name.toLocaleLowerCase() === 'notsenterror');
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

    public getAttachments(inline?: boolean): Attachment[] {
        let attachments = this.Attachments;
        if (inline) {
            attachments = this.Attachments.filter((a) => a.Disposition === 'inline');
        } else {
            attachments = this.Attachments.filter((a) => a.Disposition !== 'inline');
        }
        return attachments;
    }

    public static isArticleProperty(property: string): boolean {
        const articleProperty = Object.keys(ArticleProperty).map((p) => ArticleProperty[p]);
        return articleProperty.some((p) => p === property);
    }
}
