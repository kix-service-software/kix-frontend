/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DataType } from '../../../../model/DataType';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { SortOrder } from '../../../../model/SortOrder';
import { SortUtil } from '../../../../model/SortUtil';
import { AbstractPlaceholderHandler } from '../../../../modules/base-components/webapp/core/AbstractPlaceholderHandler';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { IPlaceholderHandler } from '../../../base-components/webapp/core/IPlaceholderHandler';
import { Contact } from '../../../customer/model/Contact';
import { Organisation } from '../../../customer/model/Organisation';
import { ContactPlaceholderHandler } from '../../../customer/webapp/core/ContactPlaceholderHandler';
import { OrganisationPlaceholderHandler } from '../../../customer/webapp/core/OrganisationPlaceholderHandler';
import { DynamicFieldValuePlaceholderHandler } from '../../../dynamic-fields/webapp/core/DynamicFieldValuePlaceholderHandler';
import { User } from '../../../user/model/User';
import { UserProperty } from '../../../user/model/UserProperty';
import { UserPlaceholderHandler } from '../../../user/webapp/core/UserPlaceholderHandler';
import { Article } from '../../model/Article';
import { ArticleLoadingOptions } from '../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../model/ArticleProperty';
import { Ticket } from '../../model/Ticket';
import { TicketProperty } from '../../model/TicketProperty';
import { ArticlePlaceholderHandler } from './ArticlePlaceholderHandler';
import { QueuePlaceholderHandler } from './QueuePlaceholderHandler';

export class TicketPlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '050-TicketPlaceholderHandler';
    protected objectStrings: string[] = [
        'TICKET',
        'ARTICLE', 'FIRST', 'LAST', 'CUSTOMER', 'AGENT',
        'OWNER', 'TICKETOWNER', 'RESPONSIBLE', 'TICKETRESPONSIBLE',
        'CONTACT', 'ORG',
        'QUEUE'
    ];

    private relevantIdAttribut = {
        'Contact': TicketProperty.CONTACT_ID,
        'Lock': TicketProperty.LOCK_ID,
        'Organisation': TicketProperty.ORGANISATION_ID,
        'Owner': TicketProperty.OWNER_ID,
        'Priority': TicketProperty.PRIORITY_ID,
        'Queue': TicketProperty.QUEUE_ID,
        'Responsible': TicketProperty.RESPONSIBLE_ID,
        'State': TicketProperty.STATE_ID,
        // StateType has special handling in label provider
        // 'StateType': TicketProperty.STATE_TYPE_ID,
        'Type': TicketProperty.TYPE_ID
    };

    private static INSTANCE: TicketPlaceholderHandler;

    public static getInstance(): TicketPlaceholderHandler {
        if (!TicketPlaceholderHandler.INSTANCE) {
            TicketPlaceholderHandler.INSTANCE = new TicketPlaceholderHandler();
        }
        return TicketPlaceholderHandler.INSTANCE;
    }

    private extendedPlaceholderHandler: IPlaceholderHandler[] = [];

    public isHandlerForObjectType(objectType: KIXObjectType | string): boolean {
        return objectType === KIXObjectType.TICKET;
    }

    public addExtendedPlaceholderHandler(handler: IPlaceholderHandler): void {
        this.extendedPlaceholderHandler.push(handler);
    }

    public async replace(
        placeholder: string, ticket?: Ticket, language?: string, forRichtext?: boolean
    ): Promise<string> {
        let result = '';
        const objectString = PlaceholderService.getInstance().getObjectString(placeholder);
        if (this.isHandlerFor(objectString)) {
            if (!ticket) {
                ticket = await this.getTicket();
            }
            if (ticket) {
                const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
                if (attribute) {
                    switch (objectString) {
                        case 'TICKET':
                            result = await this.handleTicket(attribute, ticket, language, placeholder);
                            break;
                        case 'FIRST':
                        case 'LAST':
                            result = await this.handleFLArticle(
                                ticket, objectString, result, placeholder, language, forRichtext
                            );
                            break;
                        case 'CUSTOMER':
                        case 'AGENT':
                            result = await this.handleCAArticle(
                                ticket, objectString, result, placeholder, language, forRichtext
                            );
                            break;
                        case 'ARTICLE':
                            result = await this.handleArticle(ticket, result, placeholder, language, forRichtext);
                            break;
                        case 'OWNER':
                        case 'TICKETOWNER':
                            result = await this.handleOwner(ticket, result, placeholder, language, forRichtext);
                            break;
                        case 'RESPONSIBLE':
                        case 'TICKETRESPONSIBLE':
                            result = await this.handleResponsible(ticket, result, placeholder, language, forRichtext);
                            break;
                        case 'CONTACT':
                            result = await this.handleContact(ticket, result, placeholder, language, forRichtext);
                            break;
                        case 'ORG':
                            result = await this.handleOrganisation(ticket, result, placeholder, language);
                            break;
                        case 'QUEUE':
                            if (ticket.QueueID) {
                                result = await QueuePlaceholderHandler.prototype.replace(placeholder, ticket, language);
                            }
                            break;
                        default:
                    }
                }
            }
        }
        return result;
    }

    private async handleOrganisation(
        ticket: Ticket, result: string, placeholder: string, language: string
    ): Promise<string> {
        let organisation: Organisation;
        if (ticket.OrganisationID && !isNaN(Number(ticket.OrganisationID))) {
            const organisations = await KIXObjectService.loadObjects(
                KIXObjectType.ORGANISATION, [ticket.OrganisationID], null, null, true
            ).catch((error) => []);
            if (organisations && !!organisations.length) {
                organisation = organisations[0];
            }
        } else if (ticket instanceof Organisation) {
            organisation = ticket;
        }
        if (organisation) {
            result = await OrganisationPlaceholderHandler.prototype.replace(
                placeholder, organisation, language
            );
        }
        return result;
    }

    private async handleContact(
        ticket: Ticket, result: string, placeholder: string, language: string, forRichtext?: boolean
    ): Promise<string> {
        let contact: Contact;
        if (ticket.ContactID && !isNaN(Number(ticket.ContactID))) {
            const contacts = await KIXObjectService.loadObjects(
                KIXObjectType.CONTACT, [ticket.ContactID], null, null, true
            ).catch((error) => []);
            if (contacts && !!contacts.length) {
                contact = contacts[0];
            }
        } else if (ticket instanceof Contact) {
            contact = ticket;
        }
        if (contact) {
            result = await ContactPlaceholderHandler.prototype.replace(
                placeholder, contact, language, forRichtext
            );
        }
        return result;
    }

    private async handleResponsible(
        ticket: Ticket, result: string, placeholder: string, language: string, forRichtext?: boolean
    ): Promise<string> {
        if (ticket.ResponsibleID && !isNaN(Number(ticket.ResponsibleID))) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, null, ['Preferences']
            );
            const users = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, [ticket.ResponsibleID], loadingOptions, null, true, true, true
            ).catch((error) => [] as User[]);
            if (users && !!users.length) {
                result = await UserPlaceholderHandler.prototype.replace(
                    placeholder, users[0], language, forRichtext
                );
            }
        }
        return result;
    }

    private async handleOwner(
        ticket: Ticket, result: string, placeholder: string, language: string, forRichtext?: boolean
    ): Promise<string> {
        if (ticket.OwnerID && !isNaN(Number(ticket.OwnerID))) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null,
                ['Preferences', UserProperty.CONTACT],
                ['Preferences', UserProperty.CONTACT]
            );
            const users = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, [ticket.OwnerID], loadingOptions, null, true, true, true
            ).catch((error) => [] as User[]);
            if (users && !!users.length) {
                result = await UserPlaceholderHandler.prototype.replace(
                    placeholder, users[0], language, forRichtext
                );
            }
        }
        return result;
    }

    private async handleArticle(
        ticket: Ticket, result: string, placeholder: string, language: string, forRichtext?: boolean
    ): Promise<string> {
        const dialogContext = ContextService.getInstance().getActiveContext();
        if (dialogContext) {
            const articleId = dialogContext.getAdditionalInformation(
                ArticleProperty.REFERENCED_ARTICLE_ID
            );
            let referencedArticle;
            if (articleId) {
                const articles = await this.getArticles(ticket, Number(articleId));
                if (articles && articles.length) {
                    referencedArticle = articles[0];
                }
                if (referencedArticle) {
                    result = await ArticlePlaceholderHandler.getInstance().replace(
                        placeholder, referencedArticle, language, forRichtext
                    );
                }
            }
        }
        return result;
    }

    private async handleCAArticle(
        ticket: Ticket, objectString: string, result: string, placeholder: string, language: string,
        forRichtext?: boolean
    ): Promise<string> {
        const caArticles = await this.getArticles(ticket);
        if (caArticles && !!caArticles.length) {
            const relevantArticles = caArticles.filter(
                (a) => a.SenderType === (objectString === 'AGENT' ? 'agent' : 'external')
            );
            const lastArticle = SortUtil.sortObjects(
                relevantArticles, ArticleProperty.ARTICLE_ID, DataType.NUMBER, SortOrder.DOWN
            )[0];
            if (lastArticle) {
                result = await ArticlePlaceholderHandler.getInstance().replace(
                    placeholder, lastArticle, language, forRichtext
                );
            }
        }
        return result;
    }

    private async handleFLArticle(
        ticket: Ticket, objectString: string, result: string, placeholder: string, language: string,
        forRichtext?: boolean
    ): Promise<string> {
        const flArticles = await this.getArticles(ticket);
        if (flArticles && !!flArticles.length) {
            const article = SortUtil.sortObjects(
                flArticles, ArticleProperty.ARTICLE_ID, DataType.NUMBER,
                objectString === 'FIRST' ? SortOrder.UP : SortOrder.DOWN
            )[0];
            if (article) {
                result = await ArticlePlaceholderHandler.getInstance().replace(
                    placeholder, article, language, forRichtext
                );
            }
        }
        return result;
    }

    private async getArticles(ticket: Ticket, articleId?: number): Promise<Article[]> {
        let articles: Article[] = [];
        if (
            ticket?.Articles && ticket.Articles.length &&
            ticket.Articles.every((a) => a.ArticleID)
        ) {
            if (articleId) {
                const article = ticket.Articles.find((a) => a.ArticleID === articleId);
                if (article) {
                    articles = [article];
                }
            } else {
                articles = ticket.Articles;
            }
        } else if (ticket.TicketID) {
            articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, articleId ? [articleId] : null,
                new KIXObjectLoadingOptions(
                    null, null, null, [ArticleProperty.ATTACHMENTS]
                ), new ArticleLoadingOptions(ticket.TicketID), true
            ).catch(() => [] as Article[]);
        }
        return articles;
    }

    private async handleTicket(
        attribute: string, ticket?: Ticket, language?: string, placeholder?: string
    ): Promise<string> {
        let result = '';
        let normalTicketAttribute: boolean = true;
        const optionsString: string = PlaceholderService.getInstance().getOptionsString(placeholder);

        if (
            PlaceholderService.getInstance().isDynamicFieldAttribute(attribute) && DynamicFieldValuePlaceholderHandler
        ) {
            result = await DynamicFieldValuePlaceholderHandler.getInstance().replaceDFValue(ticket, optionsString);
            normalTicketAttribute = false;
        } else if (this.extendedPlaceholderHandler.length && placeholder) {
            const handler = SortUtil.sortObjects(this.extendedPlaceholderHandler, 'handlerId').find(
                (ph) => ph.isHandlerFor(placeholder)
            );
            if (handler) {
                result = await handler.replace(placeholder, ticket, language);
                normalTicketAttribute = false;
            }
        }

        if (normalTicketAttribute && this.isKnownProperty(attribute)) {
            switch (attribute) {
                case 'ID':
                    result = ticket[TicketProperty.TICKET_ID] ? ticket[TicketProperty.TICKET_ID].toString() : '';
                    break;
                case TicketProperty.AGE:
                    const createDate = new Date(ticket.Created);
                    const age = (Date.now() - createDate.getTime()) / 1000;
                    result = DateTimeUtil.calculateTimeInterval(age);
                    break;
                case TicketProperty.STATE_ID:
                case TicketProperty.QUEUE_ID:
                case TicketProperty.PRIORITY_ID:
                case TicketProperty.LOCK_ID:
                case TicketProperty.ORGANISATION_ID:
                case TicketProperty.CONTACT_ID:
                case TicketProperty.OWNER_ID:
                case TicketProperty.TYPE_ID:
                case TicketProperty.RESPONSIBLE_ID:
                case TicketProperty.TICKET_ID:
                    result = ticket[attribute] ? ticket[attribute].toString() : '';
                    break;
                case TicketProperty.CREATED:
                case TicketProperty.CHANGED:
                case TicketProperty.PENDING_TIME:
                    result = await DateTimeUtil.getLocalDateTimeString(ticket[attribute], language);
                    break;
                case TicketProperty.CREATED_TIME_UNIX:
                    if (Number.isInteger(Number(ticket[attribute]))) {
                        result = await DateTimeUtil.getLocalDateTimeString(Number(ticket[attribute]) * 1000, language);
                    }
                    break;
                case TicketProperty.TITLE:
                    result = typeof ticket.Title !== 'undefined' ? ticket.Title : await this.getArticleSubject();
                    if (optionsString && Number.isInteger(Number(optionsString))) {
                        result = result.substr(0, Number(optionsString));
                    }
                    break;
                case TicketProperty.ARTICLES:
                case TicketProperty.ARTICLE_CREATE_TIME:
                case TicketProperty.ARTICLE_FLAG:
                case TicketProperty.ATTACHMENT_NAME:
                case KIXObjectProperty.DYNAMIC_FIELDS:
                case TicketProperty.LAST_CHANGE_TIME:
                case TicketProperty.LINKED_AS:
                case TicketProperty.TICKET_FLAG:
                case TicketProperty.WATCHERS:
                case ArticleProperty.FROM:
                case ArticleProperty.TO:
                case ArticleProperty.CC:
                case ArticleProperty.SUBJECT:
                case ArticleProperty.BODY:
                    break;
                default:
                    attribute = this.relevantIdAttribut[attribute] || attribute;
                    result = await LabelService.getInstance().getDisplayText(ticket, attribute, undefined, false);
                    result = typeof result !== 'undefined' && result !== null
                        ? await TranslationService.translate(result.toString(), undefined, language) : '';
            }
        }
        return result;
    }

    private isKnownProperty(property: string): boolean {
        const knownProperties = [
            ...Object.keys(TicketProperty).map((p) => TicketProperty[p]),
            ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p]),
            ...Object.keys(ArticleProperty).map((p) => ArticleProperty[p]),
            ...Object.keys(this.relevantIdAttribut),
            'ID'
        ];
        return knownProperties.some((p) => p === property);
    }

    public async getTicket(): Promise<Ticket> {
        const ticket = new Ticket();
        await this.prepareObject(ticket);
        this.preparePendingTimeUnix(ticket);
        return ticket;
    }

    private preparePendingTimeUnix(ticket: Ticket): void {
        if (ticket.PendingTime) {
            const pendingTimeUnix = Date.parse(ticket.PendingTime);
            if (!isNaN(Number(pendingTimeUnix))) {
                ticket.PendingTimeUnix = Math.floor(Number(pendingTimeUnix) / 1000);
            }
        }
    }

    protected ignoreProperty(property: string): boolean {
        switch (property) {
            case TicketProperty.UNSEEN:
            case KIXObjectProperty.OBJECT_ID:
            case KIXObjectProperty.OBJECT_TYPE:
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CREATE_TIME:
            case KIXObjectProperty.CHANGE_BY:
            case KIXObjectProperty.CHANGE_TIME:
                return true;
            default:
                return super.ignoreProperty(property);
        }
    }

    private async getArticleSubject(): Promise<string> {
        let subject = '';
        const dialogContext = ContextService.getInstance().getActiveContext();
        if (dialogContext) {
            const context = ContextService.getInstance().getActiveContext();
            const formInstance = await context?.getFormManager()?.getFormInstance();
            const subjectValue = formInstance
                ? await formInstance.getFormFieldValueByProperty(ArticleProperty.SUBJECT) : null;
            subject = subjectValue && subjectValue.value ? subjectValue.value.toString() : '';
        }
        return subject;
    }
}
