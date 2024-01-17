/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Ticket } from '../model/Ticket';
import { IdService } from '../../../model/IdService';
import { TicketAPIService } from './TicketService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { TicketProperty } from '../model/TicketProperty';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { ModuleConfigurationService } from '../../../server/services/configuration/ModuleConfigurationService';
import { ObjectInformationWidgetConfiguration } from '../../../model/configuration/ObjectInformationWidgetConfiguration';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { ArticleProperty } from '../model/ArticleProperty';
import { QueueAPIService } from './QueueService';
import { TicketStateAPIService } from './TicketStateService';
import { TicketPriorityAPIService } from './TicketPriorityService';
import { TicketTypeAPIService } from './TicketTypeService';
import { OrganisationAPIService } from '../../customer/server/OrganisationService';
import { ContactAPIService } from '../../customer/server/ContactService';
import { UserService } from '../../user/server/UserService';
import { TranslationAPIService } from '../../translation/server/TranslationService';
import { DateTimeAPIUtil } from '../../../server/services/DateTimeAPIUtil';
import { SysConfigOption } from '../../sysconfig/model/SysConfigOption';
import { SysConfigService } from '../../sysconfig/server/SysConfigService';
import { SysConfigKey } from '../../sysconfig/model/SysConfigKey';
import { SearchProperty } from '../../search/model/SearchProperty';
import { Article } from '../model/Article';
import { InlineContent } from '../../base-components/webapp/core/InlineContent';
import { Attachment } from '../../../model/kix/Attachment';
import { DynamicFieldValue } from '../../dynamic-fields/model/DynamicFieldValue';
import { TicketDetailsDFDataBuilder } from './TicketDetailsDFDataBuilder';
import { KIXObject } from '../../../model/kix/KIXObject';
import { Contact } from '../../customer/model/Contact';
import { Organisation } from '../../customer/model/Organisation';
import { User } from '../../user/model/User';
import { UserProperty } from '../../user/model/UserProperty';
import { Queue } from '../model/Queue';
import { TicketState } from '../model/TicketState';
import { TicketPriority } from '../model/TicketPriority';
import { TicketType } from '../model/TicketType';
import { ExtendedTicketDetailsDataBuilder } from './ExtendedTicketDetailsDataBuilder';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class TicketDetailsDataBuilder {

    public static async buildTicketData(token: string, ticketId: number): Promise<any> {
        const data = {};
        const ticket = await this.loadTicket(token, ticketId);
        if (ticket) {
            data['title'] = ticket.Title;
            data['properties'] = await this.getTicketProperties(token, ticket);
            data['articles'] = await this.getArticles(token, ticket);
        }
        return data;
    }

    private static extendedDataBuilders: ExtendedTicketDetailsDataBuilder[] = [];
    public static registerExtendedTicketDataBuilder(dataBuilder: ExtendedTicketDetailsDataBuilder): void {
        if (dataBuilder) {
            this.extendedDataBuilders.push(dataBuilder);
        }
    }

    private static async loadTicket(token: string, ticketId: number): Promise<Ticket> {
        let ticket: Ticket;
        if (token && ticketId) {
            const requestId = IdService.generateDateBasedId();
            const objectResponse = await TicketAPIService.getInstance().loadObjects<Ticket>(
                token, requestId, KIXObjectType.TICKET, [ticketId],
                new KIXObjectLoadingOptions(
                    undefined, undefined, undefined,
                    [
                        TicketProperty.STATE_TYPE,
                        TicketProperty.ARTICLES,
                        ArticleProperty.ATTACHMENTS,
                        KIXObjectProperty.DYNAMIC_FIELDS
                    ]
                ), undefined
            ).catch(() => new ObjectResponse<Ticket>());

            const tickets = objectResponse?.objects;
            ticket = tickets && tickets.length ? tickets[0] : null;
        }
        return ticket;
    }

    private static async getTicketProperties(token: string, ticket: Ticket): Promise<Array<[string, any]>> {
        const properties = [];

        const configuration =
            await ModuleConfigurationService.getInstance().loadConfiguration<ObjectInformationWidgetConfiguration>(
                token, 'ticket-details-print-config'
            );

        if (configuration && configuration.properties) {
            let ticketProperties = configuration.properties;
            if (ticket.StateType !== 'pending reminder' && ticket.StateType !== 'pending auto') {
                ticketProperties = ticketProperties.filter((p) => p !== TicketProperty.PENDING_TIME);
            }

            for (let property of ticketProperties) {
                let value = ticket[property];
                const dfName = KIXObjectAPIService.getDynamicFieldName(property);
                if (dfName) {
                    property = dfName;
                    const fieldValue = ticket[KIXObjectProperty.DYNAMIC_FIELDS].find((dfv) => dfv.Name === dfName);
                    if (fieldValue) {
                        value = fieldValue.DisplayValue;
                    }
                } else {
                    value = await this.getDisplayValue(token, ticket, property);
                }

                const propertyText = await this.getPropertyText(token, property);
                properties.push([propertyText, value]);
            }
        }

        return properties;
    }

    private static async getArticles(token: string, ticket: Ticket): Promise<Array<[string, any]>> {
        const articles = [];

        for (const article of ticket.Articles) {

            const preparedArticle = {
                subject: article.Subject,
                body: article.Body,
                properties: [],
                content: '',
                inlineContent: []
            };

            const fromProperty = await this.getPropertyText(token, ArticleProperty.FROM);
            preparedArticle.properties.push([fromProperty, article.From]);

            const toProperty = await this.getPropertyText(token, ArticleProperty.TO);
            preparedArticle.properties.push([toProperty, article.To]);

            const ccProperty = await this.getPropertyText(token, ArticleProperty.CC);
            preparedArticle.properties.push([ccProperty, article.Cc]);

            const createTimeProperty = await this.getPropertyText(token, KIXObjectProperty.CREATE_TIME);
            const createTime = await DateTimeAPIUtil.getLocalDateTimeString(token, article.CreateTime);
            preparedArticle.properties.push([createTimeProperty, createTime]);

            const prepareContent = await this.getPreparedArticleBodyContent(token, article);
            preparedArticle.content = prepareContent[0];
            preparedArticle.inlineContent = prepareContent[1];

            articles.push(preparedArticle);
        }

        return articles;
    }

    private static async getDisplayValue(token: string, ticket: Ticket, property: string): Promise<string> {
        for (const builder of this.extendedDataBuilders) {
            const result = await builder.getDisplayValue(token, ticket, property);
            if (typeof result !== 'undefined' && result !== null) {
                return result;
            }
        }

        const value = ticket[property];
        let displayValue = value;

        const language = await TranslationAPIService.getUserLanguage(token);

        switch (property) {
            case TicketProperty.QUEUE_ID:
                if (value) {
                    const object = await this.loadObjectDisplayValue<Queue>(
                        token, QueueAPIService.getInstance(), value, KIXObjectType.QUEUE
                    );
                    displayValue = object ? object.Name : value;
                }
                break;
            case TicketProperty.STATE_ID:
                if (value) {
                    const object = await this.loadObjectDisplayValue<TicketState>(
                        token, TicketStateAPIService.getInstance(), value, KIXObjectType.TICKET_STATE
                    );
                    displayValue = object ? object.Name : value;
                }
                break;
            case TicketProperty.PRIORITY_ID:
                if (value) {
                    const object = await this.loadObjectDisplayValue<TicketPriority>(
                        token, TicketPriorityAPIService.getInstance(), value, KIXObjectType.TICKET_PRIORITY
                    );
                    displayValue = object ? object.Name : value;
                }
                break;
            case TicketProperty.TYPE_ID:
                if (value) {
                    const object = await this.loadObjectDisplayValue<TicketType>(
                        token, TicketTypeAPIService.getInstance(), value, KIXObjectType.TICKET_TYPE
                    );
                    displayValue = object ? object.Name : value;
                }
                break;
            case TicketProperty.ORGANISATION_ID:
                if (value) {
                    const object = await this.loadObjectDisplayValue<Organisation>(
                        token, OrganisationAPIService.getInstance(), value, KIXObjectType.ORGANISATION
                    );
                    displayValue = object ? object.Name : value;
                }
                break;
            case TicketProperty.CONTACT_ID:
                if (value) {
                    const object = await this.loadObjectDisplayValue<Contact>(
                        token, ContactAPIService.getInstance(), value, KIXObjectType.CONTACT
                    );
                    displayValue = object ? object.Fullname : value;
                }
                break;
            case TicketProperty.CREATED:
            case TicketProperty.CHANGED:
            case TicketProperty.PENDING_TIME:
                if (value) {
                    displayValue = await DateTimeAPIUtil.getLocalDateTimeString(token, displayValue);
                }
                break;
            case TicketProperty.CREATED_TIME_UNIX:
                if (displayValue) {
                    displayValue = await DateTimeAPIUtil.getLocalDateTimeString(token, Number(displayValue) * 1000);
                }
                break;
            case TicketProperty.LOCK_ID:
                if (typeof value !== 'undefined') {
                    displayValue = value === 1 ? 'Translatable#Unlocked' : 'Translatable#Locked';
                }
                break;
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
                if (value) {
                    const object = await this.loadObjectDisplayValue<User>(
                        token, UserService.getInstance(), value, KIXObjectType.USER, [UserProperty.CONTACT]
                    );
                    displayValue = object && object.Contact
                        ? object.Contact.Fullname
                        : object ? object.UserLogin : value;
                }
                break;
            case TicketProperty.AGE:
                if (value) {
                    displayValue = DateTimeAPIUtil.calculateTimeInterval(Number(displayValue));
                }
                break;
            default:
                const dfName = KIXObjectAPIService.getDynamicFieldName(property);
                if (dfName) {
                    const preparedValue = await TicketDetailsDFDataBuilder.getDFDisplayValues(
                        token,
                        new DynamicFieldValue({ Name: dfName, Value: value } as DynamicFieldValue)
                    );
                    if (preparedValue && preparedValue[1]) {
                        displayValue = preparedValue[1];
                    } else {
                        displayValue = value.toString();
                    }
                }
        }

        if (displayValue) {
            displayValue = await TranslationAPIService.getInstance().translate(
                displayValue.toString(), [], language
            );
        }
        return displayValue ? displayValue.toString() : '';
    }

    private static async getPropertyText(token: string, property: string): Promise<string> {
        for (const builder of this.extendedDataBuilders) {
            const result = await builder.getPropertyText(token, property);
            if (typeof result !== 'undefined' && result !== null) {
                return result;
            }
        }

        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case TicketProperty.WATCHERS:
                displayValue = 'Translatable#Observer';
                break;
            case TicketProperty.TITLE:
                displayValue = 'Translatable#Title';
                break;
            case TicketProperty.CHANGED:
                displayValue = 'Translatable#Changed at';
                break;
            case TicketProperty.CREATED:
                displayValue = 'Translatable#Created at';
                break;
            case TicketProperty.LOCK_ID:
                displayValue = 'Translatable#Lock State';
                break;
            case TicketProperty.PRIORITY_ID:
                displayValue = 'Translatable#Priority';
                break;
            case TicketProperty.TYPE_ID:
                displayValue = 'Translatable#Type';
                break;
            case TicketProperty.QUEUE_ID:
                displayValue = 'Translatable#Queue';
                break;
            case TicketProperty.STATE_ID:
                displayValue = 'Translatable#State';
                break;
            case TicketProperty.OWNER_ID:
                displayValue = 'Translatable#Owner';
                break;
            case TicketProperty.RESPONSIBLE_ID:
                displayValue = 'Translatable#Responsible';
                break;
            case TicketProperty.ORGANISATION_ID:
                displayValue = 'Translatable#Organisation';
                break;
            case TicketProperty.CONTACT_ID:
                displayValue = 'Translatable#Contact';
                break;
            case TicketProperty.AGE:
                displayValue = 'Translatable#Age';
                break;
            case TicketProperty.PENDING_TIME:
                displayValue = 'Translatable#Pending until';
                break;
            case TicketProperty.TICKET_NUMBER:
                const objectResponse = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                    token, '', KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_HOOK], null, null
                ).catch(() => new ObjectResponse<SysConfigOption>());

                const hookConfig = objectResponse?.objects || [];
                if (hookConfig && hookConfig.length) {
                    displayValue = hookConfig[0].Value;
                }
                break;
            case TicketProperty.TICKET_FLAG:
                displayValue = 'Translatable#Ticket Flags';
                break;
            case TicketProperty.CLOSE_TIME:
                displayValue = 'Translatable#Closed at';
                break;
            case TicketProperty.LAST_CHANGE_TIME:
                displayValue = 'Translatable#Last changed time';
                break;
            case TicketProperty.ARCHIVE_FLAG:
                displayValue = 'Translatable#Archived';
                break;
            case KIXObjectProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case KIXObjectProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            default:
        }

        if (displayValue) {
            const language = await TranslationAPIService.getUserLanguage(token);
            displayValue = await TranslationAPIService.getInstance().translate(displayValue.toString(), [], language);
        }

        return displayValue;
    }

    private static async loadObjectDisplayValue<T extends KIXObject>(
        token: string, service: KIXObjectAPIService, id: number, objectType: KIXObjectType,
        includes?: string[]
    ): Promise<T> {
        let loadingOptions: KIXObjectLoadingOptions;

        if (includes && includes.length) {
            loadingOptions = new KIXObjectLoadingOptions(null, null, null, includes);
        }

        const objectResponse = await service.loadObjects(
            token, '', objectType, [id], loadingOptions, null
        ).catch((error) => new ObjectResponse());

        const objects = objectResponse?.objects;
        return objects && !!objects.length ? objects[0] : null;
    }

    private static async getPreparedArticleBodyContent(
        token: string, article: Article
    ): Promise<[string, InlineContent[]]> {
        if (article.bodyAttachment) {

            const attachmentWithContent = await this.loadArticleAttachment(
                token, article.TicketID, article.ArticleID, article.bodyAttachment.ID
            );

            const inlineAttachments = article.getAttachments(true);
            for (const inlineAttachment of inlineAttachments) {
                const attachment = await this.loadArticleAttachment(
                    token, article.TicketID, article.ArticleID, inlineAttachment.ID
                );
                if (attachment) {
                    inlineAttachment.Content = attachment.Content;
                }
            }

            const inlineContent: InlineContent[] = [];
            inlineAttachments.forEach(
                (a) => inlineContent.push(new InlineContent(a.ContentID, a.Content, a.ContentType))
            );

            let buffer = Buffer.from(attachmentWithContent.Content, 'base64');
            const encoding = attachmentWithContent.charset ? attachmentWithContent.charset : 'utf8';
            if (encoding !== 'utf8' && encoding !== 'utf-8') {
                const iconv = require('iconv-lite');
                buffer = iconv.decode(buffer, encoding);
            }

            let content = buffer.toString('utf8');
            const match = content.match(/(<body[^>]*>)([\w|\W]*)(<\/body>)/);
            if (match && match.length >= 3) {
                content = match[2];
            }

            return [content, inlineContent];
        } else {
            const body = article.Body.replace(/(\n|\r)/g, '<br>');
            return [body, null];
        }
    }

    private static async loadArticleAttachment(
        token: string, ticketId: number, articleId: number, attachmentId: number
    ): Promise<Attachment> {
        const attachment = await TicketAPIService.getInstance().loadArticleAttachment(
            token, ticketId, articleId, attachmentId
        ).catch(() => null);
        return attachment;
    }
}
