import { IPlaceholderHandler, PlaceholderService } from "../placeholder";
import {
    Ticket, TicketProperty, DateTimeUtil, ArticleProperty, KIXObjectType, SortUtil, DataType, SortOrder,
    ContextType, User, KIXObjectLoadingOptions, Contact, Organisation
} from "../../model";
import { LabelService } from "../LabelService";
import { TranslationService } from "../i18n/TranslationService";
import { ArticlePlaceholderHandler } from "./ArticlePlaceholderHandler";
import { ContextService } from "../context";
import { KIXObjectService } from "../kix";
import { UserPlaceholderHandler } from "../user";
import { ContactPlaceholderHandler } from "../contact";
import { OrganisationPlaceholderHandler } from "../organisation";
import { QueuePlaceholderHandler } from "./QueuePlaceholderHandler";

export class TicketPlaceholderHandler implements IPlaceholderHandler {

    public handlerId: string = 'TicketPlaceholderHandler';
    private objectStrings = [
        'TICKET',
        'ARTICLE', 'FIRST', 'LAST', 'CUSTOMER', 'AGENT',
        'OWNER', 'TICKETOWNER', 'RESPONSIBLE', 'TICKETRESPONSIBLE',
        'CONTACT', 'ORG',
        'QUEUE'
    ];

    public isHandlerFor(objectString: string): boolean {
        return this.objectStrings.some((os) => os === objectString);
    }

    public async replace(placeholder: string, ticket?: Ticket, language?: string): Promise<string> {
        let result = '';
        const objectString = PlaceholderService.getInstance().getObjectString(placeholder);
        const optionsString: string = PlaceholderService.getInstance().getOptionsString(placeholder);
        if (ticket && this.isHandlerFor(objectString)) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
            if (!PlaceholderService.getInstance().translatePlaceholder(placeholder)) {
                language = 'en';
            }
            if (attribute) {
                switch (objectString) {
                    case 'TICKET':
                        result = await this.getTicketValue(attribute, ticket, language, optionsString);
                        break;
                    case 'FIRST':
                    case 'LAST':
                        if (ticket.Articles && !!ticket.Articles.length) {
                            const article = SortUtil.sortObjects(
                                ticket.Articles, ArticleProperty.ARTICLE_ID, DataType.NUMBER,
                                objectString === 'FIRST' ? SortOrder.UP : SortOrder.DOWN
                            )[0];
                            if (article) {
                                result = await ArticlePlaceholderHandler.prototype.replace(
                                    placeholder, article, language
                                );
                            }
                        }
                        break;
                    case 'CUSTOMER':
                    case 'AGENT':
                        if (ticket.Articles && !!ticket.Articles.length) {
                            const relevantArticles = ticket.Articles.filter(
                                (a) => a.SenderType === (objectString === 'AGENT' ? 'agent' : 'customer')
                            );
                            const lastArticle = SortUtil.sortObjects(
                                relevantArticles, ArticleProperty.ARTICLE_ID, DataType.NUMBER, SortOrder.DOWN
                            )[0];
                            if (lastArticle) {
                                result = await ArticlePlaceholderHandler.prototype.replace(
                                    placeholder, lastArticle, language
                                );
                            }
                        }
                        break;
                    case 'ARTICLE':
                        if (ticket.Articles && !!ticket.Articles.length) {
                            const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
                            if (dialogContext) {
                                const articleId = dialogContext.getAdditionalInformation('REFERENCED_ARTICLE_ID');
                                if (articleId) {
                                    const referencedArticle = ticket.Articles.find(
                                        (a) => a.ArticleID.toString() === articleId.toString()
                                    );
                                    if (referencedArticle) {
                                        result = await ArticlePlaceholderHandler.prototype.replace(
                                            placeholder, referencedArticle, language
                                        );
                                    }
                                }
                            }
                        }
                        break;
                    case 'OWNER':
                    case 'TICKETOWNER':
                        if (ticket.OwnerID) {
                            const loadingOptions = new KIXObjectLoadingOptions(
                                null, null, null, null, ['Preferences']
                            );
                            const users = await KIXObjectService.loadObjects<User>(
                                KIXObjectType.USER, [ticket.OwnerID], loadingOptions, null, true
                            ).catch((error) => [] as User[]);
                            if (users && !!users.length) {
                                result = await UserPlaceholderHandler.prototype.replace(
                                    placeholder, users[0], language
                                );
                            }
                        }
                        break;
                    case 'RESPONSIBLE':
                    case 'TICKETRESPONSIBLE':
                        if (ticket.ResponsibleID) {
                            const loadingOptions = new KIXObjectLoadingOptions(
                                null, null, null, null, ['Preferences']
                            );
                            const users = await KIXObjectService.loadObjects<User>(
                                KIXObjectType.USER, [ticket.ResponsibleID], loadingOptions, null, true
                            ).catch((error) => [] as User[]);
                            if (users && !!users.length) {
                                result = await UserPlaceholderHandler.prototype.replace(
                                    placeholder, users[0], language
                                );
                            }
                        }
                        break;
                    case 'CONTACT':
                        if (ticket.ContactID) {
                            const contacts = await KIXObjectService.loadObjects<Contact>(
                                KIXObjectType.CONTACT, [ticket.ContactID], null, null, true
                            ).catch((error) => [] as Contact[]);
                            if (contacts && !!contacts.length) {
                                result = await ContactPlaceholderHandler.prototype.replace(
                                    placeholder, contacts[0], language
                                );
                            }
                        }
                        break;
                    case 'ORG':
                        if (ticket.OrganisationID) {
                            const organisations = await KIXObjectService.loadObjects<Organisation>(
                                KIXObjectType.ORGANISATION, [ticket.OrganisationID], null, null, true
                            ).catch((error) => [] as Organisation[]);
                            if (organisations && !!organisations.length) {
                                result = await OrganisationPlaceholderHandler.prototype.replace(
                                    placeholder, organisations[0], language
                                );
                            }
                        }
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
        return result;
    }

    private async getTicketValue(attribute: string, ticket?: Ticket, language?: string, optionsString?: string) {
        let result = '';
        if (this.isKnownProperty(attribute)) {
            const ticketLabelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET);
            switch (attribute) {
                case TicketProperty.STATE_ID:
                case TicketProperty.QUEUE_ID:
                case TicketProperty.PRIORITY_ID:
                case TicketProperty.LOCK_ID:
                case TicketProperty.ORGANISATION_ID:
                case TicketProperty.CONTACT_ID:
                case TicketProperty.OWNER_ID:
                case TicketProperty.TYPE_ID:
                case TicketProperty.SLA_ID:
                case TicketProperty.SERVICE_ID:
                case TicketProperty.RESPONSIBLE_ID:
                case TicketProperty.TICKET_ID:
                    result = ticket[attribute] ? ticket[attribute].toString() : '';
                    break;
                case TicketProperty.CREATED:
                case TicketProperty.CHANGED:
                case TicketProperty.PENDING_TIME:
                case TicketProperty.ESCALATION_DESTINATION_DATE:
                case TicketProperty.FIRST_RESPONSE_TIME_DESTINATION_DATE:
                case TicketProperty.UPDATE_TIME_DESTINATION_DATE:
                case TicketProperty.SOLUTION_TIME_DESTINATION_DATE:
                    result = await DateTimeUtil.getLocalDateTimeString(ticket[attribute], language);
                    break;
                case TicketProperty.ESCALATION_RESPONSE_TIME:
                case TicketProperty.ESCALATION_UPDATE_TIME:
                case TicketProperty.ESCALATION_SOLUTION_TIME:
                case TicketProperty.ESCALATION_DESTINATION_TIME:
                case TicketProperty.FIRST_RESPONSE_TIME_DESTINATION_TIME:
                case TicketProperty.UPDATE_TIME_DESTINATION_TIME:
                case TicketProperty.SOLUTION_TIME_DESTINATION_TIME:
                case TicketProperty.CREATED_TIME_UNIX:
                    if (Number.isInteger(Number(ticket[attribute]))) {
                        result = await DateTimeUtil.getLocalDateTimeString(Number(ticket[attribute]) * 1000, language);
                    }
                    break;
                case TicketProperty.TITLE:
                    result = ticket.Title ? ticket.Title :
                        ticket[ArticleProperty.SUBJECT] ? ticket[ArticleProperty.SUBJECT] : '';
                    if (optionsString && Number.isInteger(Number(optionsString))) {
                        result = result.substr(0, Number(optionsString));
                    }
                    break;
                case TicketProperty.ARTICLES:
                case TicketProperty.ARTICLE_CREATE_TIME:
                case TicketProperty.ARTICLE_FLAG:
                case TicketProperty.ATTACHMENT_NAME:
                case TicketProperty.DYNAMIC_FIELD:
                case TicketProperty.LAST_CHANGE_TIME:
                case TicketProperty.LINK:
                case TicketProperty.LINKED_AS:
                case TicketProperty.TICKET_FLAG:
                case TicketProperty.WATCHERS:
                case TicketProperty.FROM:
                case TicketProperty.TO:
                case TicketProperty.CC:
                case TicketProperty.SUBJECT:
                case TicketProperty.BODY:
                    break;
                default:
                    result = await ticketLabelProvider.getDisplayText(ticket, attribute, undefined, false);
                    result = typeof result !== 'undefined' && result !== null
                        ? await TranslationService.translate(result.toString(), undefined, language) : '';
            }
        }
        return result;
    }

    private isKnownProperty(property: string): boolean {
        const knownProperties = Object.keys(TicketProperty).map((p) => TicketProperty[p]);
        return knownProperties.some((p) => p === property);
    }
}
