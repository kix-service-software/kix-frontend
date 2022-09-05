/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormContext } from '../../../../../model/configuration/FormContext';
import { Attachment } from '../../../../../model/kix/Attachment';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ObjectFormValueMapper } from '../../../../object-forms/model/ObjectFormValueMapper';
import { ObjectCommitHandler } from '../../../../object-forms/webapp/core/ObjectCommitHandler';
import { Channel } from '../../../model/Channel';
import { Queue } from '../../../model/Queue';
import { Ticket } from '../../../model/Ticket';

export class TicketObjectCommitHandler extends ObjectCommitHandler<Ticket> {

    public constructor(protected objectValueMapper: ObjectFormValueMapper) {
        super(objectValueMapper, KIXObjectType.TICKET);
    }

    public async prepareObject(ticket: Ticket, forCommit: boolean = true): Promise<Ticket> {
        const newTicket = await super.prepareObject(ticket, forCommit);

        await this.prepareArticles(newTicket, forCommit);
        this.prepareTitle(newTicket);
        this.prepareTicket(newTicket);
        this.prepareSpecificAttributes(newTicket);

        return newTicket;
    }

    private async prepareArticles(ticket: Ticket, forCommit: boolean): Promise<void> {
        if (ticket.Articles?.length) {
            ticket.Articles = ticket.Articles.filter((a) => a.ChannelID);

            for (const article of ticket.Articles) {
                delete article.ticket;
                delete article.ChangedBy;
                delete article.Comment;
                delete article.CreatedBy;
                delete article.Flags;
                delete article.IncomingTime;
                delete article.Links;
                delete article.Plain;
                delete article.References;
                delete article.SenderType;
                delete article.bccList;
                delete article.bodyAttachment;
                delete article.ccList;
                delete article.senderType;
                delete article.toList;

                delete article.FromRealname;
                delete article.CcRealname;
                delete article.BccRealname;
                delete article.ToRealname;

                this.deleteCommonProperties(article, true);
                delete article.ValidID;

                if (forCommit) {
                    if (article.Attachments?.length) {
                        article.Attachments = await this.prepareAttachments(article.Attachments);
                    }

                    article.Body = await this.addQueueSignature(ticket.QueueID, article.Body, article.ChannelID);
                } else {
                    article.Attachments = null;
                }

                if (Array.isArray(article.From)) {
                    article.From = article.From.join(',');
                }
                if (Array.isArray(article.Cc)) {
                    article.Cc = article.Cc.join(',');
                }
                if (Array.isArray(article.Bcc)) {
                    article.Bcc = article.Bcc.join(',');
                }
            }
        }

        if (!ticket.Articles.length) {
            delete ticket.Articles;
        }
    }


    public async addQueueSignature(queueId: number, body: string, channelId: number): Promise<string> {
        if (channelId && queueId) {
            const channels = await KIXObjectService.loadObjects<Channel>(
                KIXObjectType.CHANNEL, [channelId], null, null, true
            ).catch(() => []);
            if (channels && channels[0] && channels[0].Name === 'email') {
                const queues = await KIXObjectService.loadObjects<Queue>(
                    KIXObjectType.QUEUE, [queueId], null, null, true
                );
                const queue = queues && !!queues.length ? queues[0] : null;
                if (queue && queue.Signature) {
                    body += `\n\n${queue.Signature}`;
                }
            }
        }
        return body;
    }

    private async prepareAttachments(files: Array<Attachment | File>): Promise<Attachment[]> {
        const attachments = [];
        for (let f of files) {
            if (f instanceof File) {
                const attachment = new Attachment();
                attachment.ContentType = f.type !== '' ? f.type : 'text/plain';
                attachment.Filename = f.name;
                attachment.Content = await BrowserUtil.readFile(f);
                f = attachment;
            }
            this.deleteCommonProperties(f, true);
            delete f.ValidID;
            delete f.DynamicFields;
            delete f.Comment;
            delete f.KIXObjectType;
            delete f.ID;
            attachments.push(f);
        }
        return attachments;
    }

    private prepareTitle(ticket: Ticket): void {
        if (!ticket.Title && this.objectValueMapper?.formContext === FormContext.NEW) {
            ticket.Title = new Date().toLocaleDateString();
            if (ticket.Articles?.length) {
                const article = ticket.Articles.find((a) => !a.ArticleID);
                ticket.Title = article?.Subject || ticket.Title;
            }
        }
    }

    private prepareTicket(ticket: Ticket): void {

        if (ticket.LockID === 2 && (!ticket.OwnerID || ticket.OwnerID === 1)) {
            delete ticket.LockID;
        }

        delete ticket.Age;
        delete ticket.ArchiveFlag;
        delete ticket.Changed;
        delete ticket.Comment;
        delete ticket.Contact;
        delete ticket.CreateTimeUnix;
        delete ticket.Created;
        delete ticket.History;
        delete ticket.Organisation;
        delete ticket.Owner;
        delete ticket.PendingTimeUnix;
        delete ticket.Priority;
        delete ticket.Queue;
        delete ticket.Responsible;
        delete ticket.State;
        delete ticket.StateType;
        delete ticket.TicketLock;
        delete ticket.Type;
        delete ticket.Unseen;
        delete ticket.Watchers;
        delete ticket.ValidID;
    }

    private prepareSpecificAttributes(ticket: Ticket): void {
        if ((ticket.ContactID as any) === '') {
            ticket.ContactID = null;
        }
    }
}