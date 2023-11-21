/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { Ticket } from '../../../model/Ticket';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { BreadcrumbInformation } from '../../../../../model/BreadcrumbInformation';
import { TicketContext } from './TicketContext';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { Article } from '../../../model/Article';
import { ArticleLoadingOptions } from '../../../model/ArticleLoadingOptions';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { TicketHistory } from '../../../model/TicketHistory';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ArticleLoader } from './ArticleLoader';

export class TicketDetailsContext extends Context {

    public static CONTEXT_ID = 'ticket-details';
    private articleLoader: ArticleLoader;

    public async initContext(urlParams?: URLSearchParams): Promise<void> {
        this.articleLoader = new ArticleLoader(Number(this.objectId));
    }

    public getIcon(): string {
        return 'kix-icon-ticket';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getObjectText(await this.getObject<Ticket>(), true, !short);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.TICKET, reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        let object: O;

        if (!objectType) {
            objectType = KIXObjectType.TICKET;
        }

        const ticket = await this.loadTicket(changedProperties);

        if (!ticket) {
            await ContextService.getInstance().toggleActiveContext(TicketContext.CONTEXT_ID);
            setTimeout(async () => {
                const error = await TranslationService.translate('Translatable#The requested ticket is not available due to restricted permissions.');
                BrowserUtil.openErrorOverlay(error);
            }, 500);
            return object;
        }

        if (objectType === KIXObjectType.TICKET) {
            object = ticket as any;
        } else if (objectType === KIXObjectType.ORGANISATION && ticket) {
            if (!isNaN(ticket.OrganisationID)) {
                const organisations = await KIXObjectService.loadObjects(
                    KIXObjectType.ORGANISATION, [ticket.OrganisationID]
                ).catch(() => []);
                object = organisations && organisations.length ? organisations[0] : null;
            }
        } else if (objectType === KIXObjectType.CONTACT && ticket) {
            if (!isNaN(ticket.ContactID)) {
                const contacts = await KIXObjectService.loadObjects(KIXObjectType.CONTACT, [ticket.ContactID])
                    .catch(() => []);
                object = contacts && contacts.length ? contacts[0] : null;
            }
        }

        if (reload && objectType === KIXObjectType.TICKET) {
            this.listeners.forEach((l) => l.objectListChanged(KIXObjectType.ARTICLE, []));
            setTimeout(() => {
                this.listeners.forEach(
                    (l) => l.objectChanged(Number(this.objectId), ticket, KIXObjectType.TICKET, changedProperties)
                );
            }, 100);
        }

        return object;
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<Ticket>();
        const text = await LabelService.getInstance().getObjectText(object);
        return new BreadcrumbInformation(this.getIcon(), [TicketContext.CONTEXT_ID], text);
    }

    private async loadTicket(changedProperties: string[] = [], cache: boolean = true): Promise<Ticket> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null,
            [
                'StateType', 'ObjectActions', 'SLACriteria', KIXObjectProperty.DYNAMIC_FIELDS
            ]
        );

        const ticket = this.loadDetailsObject<Ticket>(KIXObjectType.TICKET, loadingOptions);
        return ticket;
    }

    public async getObjectList<T = KIXObject>(objectType: KIXObjectType | string): Promise<T[]> {
        let objects = [];
        if (objectType === KIXObjectType.ARTICLE) {
            objects = await this.loadArticles();
        } else if (objectType === KIXObjectType.TICKET_HISTORY) {
            objects = await this.loadTicketHistory();
        } else {
            objects = await super.getObjectList<T>(objectType);
        }
        return objects;
    }

    public async reloadObjectList(objectType: KIXObjectType | string, silent: boolean = false): Promise<void> {
        if (objectType === KIXObjectType.ARTICLE) {

            // just trigger objectListChanged event
            if (!silent) {
                this.setObjectList(KIXObjectType.ARTICLE, null);
            }
        } else {
            return super.reloadObjectList(objectType, silent);
        }
    }

    private async loadArticles(force?: boolean): Promise<Article[]> {
        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.sortOrder = 'Article.IncomingTime';
        loadingOptions.limit = 0;

        const articles: Article[] = await KIXObjectService.loadObjects<Article>(
            KIXObjectType.ARTICLE, null, loadingOptions, new ArticleLoadingOptions(this.objectId)
        ).catch(() => [] as Article[]) || [];

        return articles;
    }

    private async loadTicketHistory(): Promise<TicketHistory[]> {
        const ticketHistory = await KIXObjectService.loadObjects<TicketHistory>(
            KIXObjectType.TICKET_HISTORY, [this.objectId]
        );
        return ticketHistory;
    }

    public loadArticle(articleId: number, cb: (article: Article) => void): void {
        this.articleLoader?.queueArticle(articleId, cb);
    }
}
