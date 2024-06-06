/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormContext } from '../../../../../model/configuration/FormContext';
import { Context } from '../../../../../model/Context';
import { IdService } from '../../../../../model/IdService';
import { Attachment } from '../../../../../model/kix/Attachment';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { BrowserCacheService } from '../../../../base-components/webapp/core/CacheService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { PlaceholderService } from '../../../../base-components/webapp/core/PlaceholderService';
import { FileService } from '../../../../file/webapp/core/FileService';
import { ObjectFormValue } from '../../../../object-forms/model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../../../object-forms/model/ObjectFormValueMapper';
import { ObjectCommitHandler } from '../../../../object-forms/webapp/core/ObjectCommitHandler';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { Article } from '../../../model/Article';
import { ArticleLoadingOptions } from '../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { Channel } from '../../../model/Channel';
import { Queue } from '../../../model/Queue';
import { Ticket } from '../../../model/Ticket';
import { TicketProperty } from '../../../model/TicketProperty';
import { TicketService } from '../TicketService';

export class TicketObjectCommitHandler extends ObjectCommitHandler<Ticket> {

    public constructor(protected objectValueMapper: ObjectFormValueMapper) {
        super(objectValueMapper, KIXObjectType.TICKET);
    }

    public async prepareObject(
        ticket: Ticket, objectValueMapper?: ObjectFormValueMapper, forCommit: boolean = true
    ): Promise<Ticket> {
        const newTicket = await super.prepareObject(ticket, objectValueMapper, forCommit);

        await this.prepareArticles(newTicket, forCommit, ticket.QueueID);
        await this.prepareTitle(newTicket);
        this.prepareTicket(newTicket);
        this.prepareSpecificAttributes(newTicket);

        return newTicket;
    }

    protected removeDisabledProperties(newObject: KIXObject, formValues?: ObjectFormValue<any>[]): void {
        super.removeDisabledProperties(newObject, formValues);

        if (Array.isArray(formValues)) {
            for (const k in TicketProperty) {
                if (TicketProperty[k]) {
                    const property = TicketProperty[k];
                    if (
                        property === TicketProperty.TICKET_ID ||
                        property === TicketProperty.PENDING_TIME
                    ) {
                        continue;
                    }
                    const hasValue = formValues.some((fv) => fv.property === property && fv.enabled);
                    if (!hasValue) {
                        delete newObject[property];
                    }
                }
            }
        }
    }

    private async prepareArticles(ticket: Ticket, forCommit: boolean, orgTicketQueueID: number): Promise<void> {
        if (ticket.Articles?.length) {
            ticket.Articles = ticket.Articles.filter((a) => a.ChannelID);
            /**
             * Here starts the error for the attachments
             * not being in the commitment for the other browser
             */
            for (const article of ticket.Articles) {
                this.deleteArticleProperties(article);
                this.deleteCommonProperties(article, true);

                if (forCommit) {
                    if (article.Attachments?.length) {
                        article.Attachments = await this.prepareAttachments(article.Attachments);
                    }

                    const ticketOrQueueId = ticket.QueueID ? ticket : orgTicketQueueID;
                    article.Body = await this.addQueueSignature(ticketOrQueueId, article.Body, article.ChannelID);

                    await this.prepareReferencedArticle(article, ticket);
                } else {
                    article.Attachments = null;
                    article.Body = article.Body?.replace(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, '');
                }

                this.prepareRecipients(article);
            }
        }

        if (!ticket.Articles.length) {
            delete ticket.Articles;
        }
    }

    private deleteArticleProperties(article: Article): void {
        delete article.ticket;
        delete article.ChangedBy;
        delete article.Comment;
        delete article.CreatedBy;
        delete article.Flags;
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
        delete article.ValidID;
        delete article.smimeDecrypted;
        delete article.smimeVerified;
        delete article.SMIMEEncrypted;
        delete article.SMIMEEncryptedError;
        delete article.SMIMESigned;
        delete article.SMIMESignedError;
    }

    private async prepareReferencedArticle(article: Article, ticket: Ticket): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const referencedArticleId = context?.getAdditionalInformation(
            ArticleProperty.REFERENCED_ARTICLE_ID
        );
        if (referencedArticleId) {
            const referencedArticle = await this.loadReferencedArticle(
                ticket.TicketID, referencedArticleId
            );
            if (referencedArticle) {
                article.InReplyTo = referencedArticle.MessageID?.toString();
                article.References = `${referencedArticle.References} ${referencedArticle.MessageID}`;
            }
        }
    }

    private prepareRecipients(article: Article): void {
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

    public async addQueueSignature(ticketOrQueueId: number | Ticket, body: string, channelId: number): Promise<string> {
        const queueId = typeof ticketOrQueueId === 'number' ? ticketOrQueueId : ticketOrQueueId?.QueueID;
        const config = await TicketService.getTicketModuleConfiguration();

        if (channelId && queueId && config?.addQueueSignature) {
            const channels = await KIXObjectService.loadObjects<Channel>(
                KIXObjectType.CHANNEL, [channelId], null, null, true
            ).catch(() => []);
            if (channels && channels[0] && channels[0].Name === 'email') {
                const queues = await KIXObjectService.loadObjects<Queue>(
                    KIXObjectType.QUEUE, [queueId], null, null, true
                );
                const queue = queues && !!queues.length ? queues[0] : null;
                if (queue && queue.Signature) {
                    const signature =
                        await PlaceholderService.getInstance().replacePlaceholders(
                            queue.Signature,
                            (ticketOrQueueId instanceof Ticket ? ticketOrQueueId : undefined)
                        );
                    body += `\n\n${signature}`;
                }
            }
        }
        return body;
    }

    protected async prepareAttachments(files: Array<Attachment | File>): Promise<Attachment[]> {
        let attachments = [];

        let loadingHint = await TranslationService.translate('Translatable#Prepare Attachments (0/{0})', [files.length]);
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
            loading: true, hint: loadingHint
        });

        let index = 0;
        for (let f of files) {

            index++;
            let loadingHint = await TranslationService.translate(
                'Translatable#Prepare Attachments ({0}/{1})', [index, files.length]
            );
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: loadingHint
            });

            if (f instanceof File) {
                const fileId = IdService.generateDateBasedId(f.name);
                const attachment = new Attachment();
                attachment.ContentType = f.type !== '' ? f.type : 'text/plain';
                attachment.Filename = f.name;
                attachment.downloadId = fileId;

                await FileService.uploadFile(f);
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

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
            loading: false
        });
        return attachments;
    }

    protected async prepareTitle(ticket: Ticket): Promise<void> {
        if (!ticket.Title && this.objectValueMapper?.formContext === FormContext.NEW) {
            await super.prepareTitle(ticket);

            if (!ticket.Title) {
                ticket.Title = new Date().toLocaleDateString();
            }

            if (ticket.Articles?.length) {
                const article = ticket.Articles.find((a) => !a.ArticleID);
                ticket.Title = article?.Subject || ticket.Title;
            }
        }
    }

    private prepareTicket(ticket: Ticket): void {

        if (ticket.LockID === 2 && ticket.OwnerID === 1) {
            delete ticket.LockID;
        }

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
        if (ticket['TimeUnit'] && ticket.Articles?.length) {
            ticket.Articles[0]['TimeUnit'] = ticket['TimeUnit'];
            delete ticket['TimeUnit'];
        }
    }

    public async commitObject(): Promise<string | number> {
        let sourceContext: Context;

        const id = await super.commitObject();

        const context = ContextService.getInstance().getActiveContext();
        const articleUpdateId = context?.getAdditionalInformation('ARTICLE_UPDATE_ID');

        const sourceContextInformation = context?.getAdditionalInformation(AdditionalContextInformation.SOURCE_CONTEXT);
        if (sourceContextInformation) {
            sourceContext = ContextService.getInstance().getContext(sourceContextInformation?.instanceId);
        }

        if (
            sourceContext
            && articleUpdateId
        ) {
            BrowserCacheService.getInstance().deleteKeys(KIXObjectType.ARTICLE);
            sourceContext.reloadObjectList(KIXObjectType.ARTICLE);
        }
        return id;
    }

    private async loadReferencedArticle(refTicketId: number, refArticleId: number): Promise<Article> {
        let article: Article;

        if (refArticleId && refTicketId) {
            const articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, [refArticleId], new KIXObjectLoadingOptions(
                    null, null, null, [ArticleProperty.ATTACHMENTS]
                ),
                new ArticleLoadingOptions(refTicketId), true
            ).catch(() => [] as Article[]);
            article = articles.find((a) => a.ArticleID === refArticleId);
        }
        return article;
    }

}
