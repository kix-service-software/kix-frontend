/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import addrparser from 'address-rfc2822';
import { Ticket } from './Ticket';
import { User } from '../../user/model/User';
import { Contact } from '../../customer/model/Contact';

export class Article extends KIXObject {

    public ObjectId: string | number = null;

    public KIXObjectType: KIXObjectType = KIXObjectType.ARTICLE;

    public TicketID: number = null;

    public ArticleID: number = null;

    public CustomerVisible: boolean = null;

    public From: string | Contact = null;

    public FromRealname: string = null;

    public To: string = null;

    public ToRealname: string = null;

    public Cc: string = null;

    public CcRealname: string = null;

    public Bcc: string = null;

    public BccRealname: string = null;

    public Subject: string = null;

    public Body: string = null;

    public ReplyTo: string = null;

    public MessageID: number = null;

    public InReplyTo: string = null;

    public References: string = null;

    public SenderTypeID: number = null;

    public SenderType: string = null;

    public ChannelID: number = null;

    public Channel: string = null;

    public ContentType: string = null;

    public Charset: string = null;

    public MimeType: string = null;

    public IncomingTime: number = null;

    public Attachments: Attachment[] = null;

    public Flags: ArticleFlag[] = null;

    public CreatedBy: User | number = null;
    public ChangedBy: number = null;

    public Plain: string = null;

    public Unseen: number = 0;

    public NotSent: number = 0;
    public NotSentError: string = '';

    public SMIMESigned: number = 0;
    public SMIMESignedError: string = '';
    public smimeVerified: boolean = true;
    public smimeSigned: boolean = true;

    public SMIMEEncrypted: number = 0;
    public SMIMEEncryptedError: string = '';
    public smimeDecrypted: boolean = true;
    public smimeEncrypted: boolean = true;

    // UI Properties

    public senderType: SenderType = null;
    public toList: ArticleReceiver[] = [];
    public ccList: ArticleReceiver[] = [];
    public bccList: ArticleReceiver[] = [];
    public bodyAttachment: Attachment = null;

    public ticket: Ticket;

    public constructor(article?: Article, ticket?: Ticket) {
        super(article);

        this.ticket = ticket;
        this.TicketID = this.ticket?.TicketID;

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
            this.Unseen = Number(article.Unseen);
            this.NotSent = Number(article.NotSent);
            this.NotSentError = article.NotSentError;
            this.SMIMESigned = Number(article.SMIMESigned);
            this.SMIMESignedError = article.SMIMESignedError;
            this.smimeVerified = this.SenderType === 'external' && this.SMIMESigned && !Boolean(this.SMIMESignedError);
            this.smimeSigned = this.SenderType !== 'external' && this.SMIMESigned && !Boolean(this.SMIMESignedError);
            this.SMIMEEncrypted = Number(article.SMIMEEncrypted);
            this.SMIMEEncryptedError = article.SMIMEEncryptedError;
            this.smimeDecrypted = this.SenderType === 'external' && this.SMIMEEncrypted && !Boolean(this.SMIMEEncryptedError);
            this.smimeEncrypted = this.SenderType !== 'external' && this.SMIMEEncrypted && !Boolean(this.SMIMEEncryptedError);

            this.bodyAttachment = article.bodyAttachment;

            if (typeof article.From === 'object' && !Array.isArray(article.From)) {
                this.From = new Contact(article.From);
            }

            if (Array.isArray(article.From)) {
                this.From = article.From?.length > 0 ? article.From[0] : '';
            }

            if (typeof article.CreatedBy === 'object') {
                this.CreatedBy = new User(article.CreatedBy);
            }

            if (this.Attachments) {
                let attachmentIndex = article.Attachments.findIndex(
                    (a) => a.Disposition === 'inline' && a.Filename === 'file-2'
                );

                if (attachmentIndex === -1) {
                    const attachmentNames = ['file-1', 'file-1.html'];
                    attachmentIndex = article.Attachments.findIndex(
                        (a) => a.Disposition === 'inline' && attachmentNames.some((an) => an === a.Filename)
                    );
                }

                if (attachmentIndex > -1) {
                    this.bodyAttachment = article.Attachments[attachmentIndex];
                }
            }

            this.prepareReceiverLists();
        }
    }

    private prepareReceiverLists(): void {
        this.prepareRecieverList(this.toList, this.To);
        this.prepareRecieverList(this.ccList, this.Cc);
        this.prepareRecieverList(this.bccList, this.Bcc);
    }

    public prepareRecieverList(list: ArticleReceiver[], mailValue: string): void {
        if (mailValue && !Array.isArray(mailValue)) {
            try {
                addrparser.parse(mailValue).forEach((address) => {
                    const realName = address.phrase !== '' ? address.phrase : address.address;
                    list.push(new ArticleReceiver(address.address, realName));
                });
            } catch {
                const mailList = mailValue.split(/\s*,\s*/);
                mailList.forEach((mail) => {
                    const realName = mail.replace(/(.+)\s*<.+/, '$1');
                    const address = mail.replace(/.+\s*<(.+)>/, '$1');
                    list.push(new ArticleReceiver(address ? address : mail, realName ? realName : mail));
                });
            }
        }
    }

    public isUnread(): boolean {
        if (this.Flags) {
            return !this.Flags.some(
                (af) => typeof af === 'object' && af.Name.toLocaleLowerCase() === 'seen' && af.Value === '1'
            );
        } else {
            return Boolean(Number(this.Unseen));
        }
    }

    public isUnsent(): boolean {
        if (this.Flags) {
            return this.Flags.some((af) => typeof af === 'object' && af.Name.toLocaleLowerCase() === 'notsenterror');
        } else {
            return Boolean(this.NotSentError);
        }
    }

    public getUnsentError(): string {
        const flag = this.Flags?.find((af) => typeof af === 'object' && af.Name.toLocaleLowerCase() === 'notsenterror');
        if (flag) {
            return flag.Value;
        } else {
            return this.NotSentError;
        }
    }

    public equals(article: Article): boolean {
        return this.ArticleID === article.ArticleID;
    }

    public getIdPropertyName(): string {
        return 'ArticleID';
    }

    public getAttachments(inline?: boolean): Attachment[] {
        let attachments = this.Attachments;
        if (inline && Array.isArray(this.Attachments)) {
            attachments = this.Attachments.filter((a) => a.Disposition === 'inline' && a.ContentID.length > 0);
        } else if (Array.isArray(this.Attachments)) {
            attachments = this.Attachments.filter((a) => a.Disposition !== 'inline' || a.ContentID.length === 0 && !a.Filename.match(/^file-(1|2)$/));
        }
        return attachments || [];
    }

    public static isArticleProperty(property: string): boolean {
        const articleProperty = Object.keys(ArticleProperty).map((p) => ArticleProperty[p]);
        return articleProperty.some((p) => p === property);
    }
}
