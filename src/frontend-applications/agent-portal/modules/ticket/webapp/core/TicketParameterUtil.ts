/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketProperty } from '../../model/TicketProperty';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { ArticleProperty } from '../../model/ArticleProperty';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { Ticket } from '../../model/Ticket';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { TicketLock } from '../../model/TicketLock';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { SenderType } from '../../model/SenderType';
import { Attachment } from '../../../../model/kix/Attachment';
import { BrowserUtil } from '../../../../modules/base-components/webapp/core/BrowserUtil';
import { Article } from '../../model/Article';

export class TicketParameterUtil {

    public static async prepareValue(
        property: string, value: any, forUpdate: boolean = false
    ): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        const context = ContextService.getInstance().getActiveContext();
        if (value) {
            if (property === TicketProperty.PENDING_TIME) {
                if (value) {
                    const pendingTime = DateTimeUtil.getKIXDateTimeString(value);
                    parameter.push([TicketProperty.PENDING_TIME, pendingTime]);
                }
            } else if (property === TicketProperty.TITLE) {
                parameter.push([TicketProperty.TITLE, value]);
                if (!forUpdate) {
                    parameter.push([ArticleProperty.SUBJECT, value]);
                }
            } else if (property === ArticleProperty.SUBJECT) {
                if (!forUpdate) {
                    parameter.push([TicketProperty.TITLE, value]);
                }
                parameter.push([ArticleProperty.SUBJECT, value]);
            } else if (property === ArticleProperty.ATTACHMENTS) {
                if (value) {
                    const attachments = await TicketParameterUtil.prepareAttachments(value);
                    parameter.push([ArticleProperty.ATTACHMENTS, attachments]);
                }
            } else if (property === TicketProperty.OWNER_ID) {
                if (forUpdate) {
                    if (context) {
                        const ticket = context.getObject<Ticket>();

                        const locks = await KIXObjectService.loadObjects<TicketLock>(
                            KIXObjectType.TICKET_LOCK, null
                        );

                        const lock = locks.find((tl) => tl.Name === 'lock');
                        if (ticket && lock && ticket[property] !== value) {
                            parameter.push([TicketProperty.LOCK_ID, lock.ID]);
                        }
                    }
                }
                parameter.push([property, Array.isArray(value) ? value[0] : value]);
            } else if (property === TicketProperty.RESPONSIBLE_ID) {
                parameter.push([property, Array.isArray(value) ? value[0] : value]);
            } else if (
                (
                    property === ArticleProperty.TO
                    || property === ArticleProperty.CC
                    || property === ArticleProperty.BCC
                )
                && Array.isArray(value)
            ) {
                parameter.push([property, value.join(',')]);
            } else if (property === TicketProperty.CONTACT_ID
                || property === TicketProperty.PRIORITY_ID
                || property === TicketProperty.STATE_ID
                || property === TicketProperty.TYPE_ID
                || property === TicketProperty.QUEUE_ID
            ) {
                parameter.push([property, Array.isArray(value) ? value[0] : value]);
            } else if (property === ArticleProperty.CHANNEL_ID) {
                if (Array.isArray(value)) {
                    parameter.push([property, Number(value[0])]);
                } else {
                    parameter.push([property, Number(value)]);
                }
            } else if (property === ArticleProperty.CUSTOMER_VISIBLE) {
                if (Array.isArray(value)) {
                    parameter.push([property, Number(value[0])]);
                } else {
                    parameter.push([property, Number(value)]);
                }
            } else {
                parameter.push([property, value]);
            }
        } else {
            parameter.push([property, value]);
        }

        const referencedArticleID = context.getAdditionalInformation('REFERENCED_ARTICLE_ID');
        if (referencedArticleID) {
            const articles = await context.getObjectList<Article>(KIXObjectType.ARTICLE);
            if (Array.isArray(articles)) {
                const article = articles.find((a) => a.ArticleID === referencedArticleID);
                if (article) {
                    parameter.push([ArticleProperty.IN_REPLY_TO, article.MessageID]);
                }
            }
        }

        return parameter;
    }

    public static async getPredefinedParameter(forUpdate: boolean = false): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];

        const loadingOptionsSenderType = new KIXObjectLoadingOptions([
            new FilterCriteria('Name', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'agent')
        ]);
        const senderTypes = await KIXObjectService.loadObjects<SenderType>(
            KIXObjectType.SENDER_TYPE, null, loadingOptionsSenderType
        );

        if (forUpdate) {
            parameter.push([ArticleProperty.SENDER_TYPE_ID, senderTypes[0].ID]);
        }

        const dialogContext = ContextService.getInstance().getActiveContext();
        if (dialogContext) {
            const referencedArticleId = dialogContext.getAdditionalInformation('REFERENCED_ARTICLE_ID');
            if (referencedArticleId) {
                parameter.push([ArticleProperty.REFERENCED_ARTICLE_ID, referencedArticleId]);
                const reply = dialogContext.getAdditionalInformation('ARTICLE_REPLY');
                if (reply) {
                    parameter.push([ArticleProperty.EXEC_REPLY, 1]);
                }
                const forward = dialogContext.getAdditionalInformation('ARTICLE_FORWARD');
                if (!reply && forward) {
                    parameter.push([ArticleProperty.EXEC_FORWARD, 1]);
                }
            }
        }

        return parameter;
    }

    private static async prepareAttachments(files: File[]): Promise<Attachment[]> {
        const attachments = [];
        for (const f of files) {
            const attachment = new Attachment();
            if (f instanceof File) {
                attachment.ContentType = f.type !== '' ? f.type : 'text';
                attachment.Filename = f.name;
                attachment.Content = await BrowserUtil.readFile(f);
                attachments.push(attachment);
            } else {
                attachments.push(f);
            }
        }
        return attachments;
    }
}
