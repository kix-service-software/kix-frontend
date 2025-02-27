/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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
import { TicketProperty } from '../../../model/TicketProperty';
import { TicketService } from '../TicketService';
import { TicketRouteConfiguration } from '../../../model/TicketRouteConfiguration';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';

export class TicketDetailsContext extends Context {

    public static CONTEXT_ID = 'ticket-details';
    public articleLoader: ArticleLoader;
    public articleDetailsLoader: ArticleLoader;

    public async initContext(urlParams?: URLSearchParams): Promise<void> {
        this.articleLoader = new ArticleLoader(Number(this.objectId), this, false);
        this.articleDetailsLoader = new ArticleLoader(Number(this.objectId), this, true);
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
            this.handleMissingObject();
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

    private async handleMissingObject(): Promise<void> {
        const moduleConfiguration = await TicketService.getTicketModuleConfiguration();
        const routeConfiguration = moduleConfiguration?.ticketRouteConfiguration || new TicketRouteConfiguration();

        const contextId = routeConfiguration?.targetContextId || TicketContext.CONTEXT_ID;
        const severity = routeConfiguration?.severity || 'info';

        await ContextService.getInstance().toggleActiveContext(contextId);

        setTimeout(async () => {
            EventService.getInstance().publish(ApplicationEvent.CLOSE_OVERLAY);

            const message = await TranslationService.translate('Translatable#The requested ticket is not available due to restricted permissions.');
            if (severity.toLocaleLowerCase() === 'error') {
                BrowserUtil.openErrorOverlay(message);
            } else {
                BrowserUtil.openInfoOverlay(message);
            }
        }, 1500);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<Ticket>();
        const text = await LabelService.getInstance().getObjectText(object);
        return new BreadcrumbInformation(this.getIcon(), [TicketContext.CONTEXT_ID], text);
    }

    private async loadTicket(changedProperties: string[] = [], cache: boolean = true): Promise<Ticket> {
        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.includes.push(
            'StateType', 'ObjectActions', 'SLACriteria', KIXObjectProperty.DYNAMIC_FIELDS,
            TicketProperty.WATCHER_ID, KIXObjectProperty.LINK_COUNT, TicketProperty.ARTICLE_IDS
        );

        const ticket = this.loadDetailsObject<Ticket>(KIXObjectType.TICKET, loadingOptions);

        return ticket;
    }

    protected async postLoadDetailsObject(ticket: Ticket): Promise<void> {
        // mark ticket as seen if it is unseen and has no articles
        // because the "article mark as seen" handling will not trigger without articles
        if (ticket?.TicketID && Number(ticket?.Unseen) && !ticket?.ArticleIDs?.length) {
            await TicketService.getInstance().markTicketAsSeen(ticket.TicketID);
            ticket.Unseen = 0; // just set it seen (reload because of this is not really necessary)
        }
    }

    public async getObjectList<T = KIXObject>(objectType: KIXObjectType | string): Promise<T[]> {
        let objects = [];
        if (objectType === KIXObjectType.ARTICLE) {

            // load ticket (get current article id list from it)
            this.loadTicket();
        } else if (objectType === KIXObjectType.TICKET_HISTORY) {
            objects = await this.loadTicketHistory();
        } else {
            objects = await super.getObjectList<T>(objectType);
        }
        return objects;
    }

    public async reloadObjectList(
        objectType: KIXObjectType | string, silent: boolean = false, limit?: number
    ): Promise<void> {
        if (objectType === KIXObjectType.ARTICLE) {

            // just trigger objectListChanged event
            if (!silent) {
                this.setObjectList(KIXObjectType.ARTICLE, null);
            }
        } else {
            return super.reloadObjectList(objectType, silent, limit);
        }
    }

    private async loadTicketHistory(): Promise<TicketHistory[]> {
        const ticketHistory = await KIXObjectService.loadObjects<TicketHistory>(
            KIXObjectType.TICKET_HISTORY, [this.objectId]
        );
        return ticketHistory;
    }

}
