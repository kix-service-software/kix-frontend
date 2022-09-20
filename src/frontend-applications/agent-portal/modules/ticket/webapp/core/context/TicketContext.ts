/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { TicketProperty } from '../../../model/TicketProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextUIEvent } from '../../../../base-components/webapp/core/ContextUIEvent';
import { SearchProperty } from '../../../../search/model/SearchProperty';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { ContextPreference } from '../../../../../model/ContextPreference';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';

export class TicketContext extends Context {

    public static CONTEXT_ID: string = 'tickets';

    public queueId: number;
    public filterValue: string;

    public async initContext(urlParams?: URLSearchParams): Promise<void> {
        super.initContext();

        if (this.queueId || this.filterValue) {
            this.loadTickets();
        }
    }

    public getIcon(): string {
        return 'kix-icon-ticket';
    }

    public async getDisplayText(): Promise<string> {
        let text = await TranslationService.translate('Translatable#Tickets');
        if (this.queueId) {
            const queueName = await LabelService.getInstance().getPropertyValueDisplayText(
                KIXObjectType.TICKET, TicketProperty.QUEUE_ID, this.queueId
            );
            text = await TranslationService.translate('Translatable#Tickets: {0}', [queueName]);
        }
        return text;
    }

    public async update(urlParams: URLSearchParams): Promise<void> {
        this.handleURLParams(urlParams);
    }

    private handleURLParams(urlParams: URLSearchParams): void {
        if (urlParams) {
            this.setQueue(urlParams.has('queueId') ? Number(urlParams.get('queueId')) : null, false);
            this.setFilterValue(urlParams.has('filter') ? decodeURI(urlParams.get('filter')) : null, false);
        }
    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = this.descriptor.urlPaths[0];
            const params = [];
            if (this.queueId) {
                params.push(`queueId=${encodeURIComponent(this.queueId)}`);
            }

            if (this.filterValue) {
                params.push(`filter=${encodeURIComponent(this.filterValue)}`);
            }

            if (params.length) {
                url += `?${params.join('&')}`;
            }
        }
        return url;
    }

    public async setQueue(queueId: number, history: boolean = true): Promise<void> {
        if (!this.queueId || this.queueId !== queueId) {
            this.queueId = queueId;
            this.loadTickets();

            EventService.getInstance().publish(ContextEvents.CONTEXT_PARAMETER_CHANGED, this);

            if (history) {
                ContextService.getInstance().setDocumentHistory(true, this, this, null);
            }

            const isStored = await ContextService.getInstance().isContextStored(this.instanceId);
            if (isStored) {
                ContextService.getInstance().updateStorage(this.instanceId);
            }
        }
    }

    public async setFilterValue(filterValue: string, history: boolean = true): Promise<void> {
        this.filterValue = filterValue;
        this.loadTickets();

        EventService.getInstance().publish(ContextEvents.CONTEXT_PARAMETER_CHANGED, this);

        if (history) {
            ContextService.getInstance().setDocumentHistory(true, this, this, null);
        }

        const isStored = await ContextService.getInstance().isContextStored(this.instanceId);
        if (isStored) {
            ContextService.getInstance().updateStorage(this.instanceId);
        }
    }

    private async loadTickets(silent: boolean = false): Promise<void> {
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS, KIXObjectType.TICKET);

        const loadingOptions = new KIXObjectLoadingOptions(
            [], null, null, [KIXObjectProperty.DYNAMIC_FIELDS, TicketProperty.STATE_TYPE]
        );

        if (this.queueId) {
            const queueFilter = new FilterCriteria(
                TicketProperty.QUEUE_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, this.queueId
            );
            loadingOptions.filter.push(queueFilter);
        }

        if (this.filterValue) {
            const fulltextFilter = new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, this.filterValue
            );
            loadingOptions.filter.push(fulltextFilter);
        }

        if (!this.queueId) {
            loadingOptions.limit = 100;
            loadingOptions.sortOrder = '-Ticket.Age:numeric';

            if (!this.filterValue) {
                loadingOptions.filter.push(new FilterCriteria(
                    TicketProperty.OWNER_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, 1
                ));
            }

            loadingOptions.filter.push(new FilterCriteria(
                TicketProperty.STATE_TYPE, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'new'
            ));
        } else {
            loadingOptions.filter.push(new FilterCriteria(
                TicketProperty.STATE_TYPE, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Open'
            ));
        }

        const tickets = await KIXObjectService.loadObjects(
            KIXObjectType.TICKET, null, loadingOptions, null, false
        ).catch((error) => []);

        this.setObjectList(KIXObjectType.TICKET, tickets, silent);
        this.setFilteredObjectList(KIXObjectType.TICKET, tickets, silent);

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
    }

    public reloadObjectList(objectType: KIXObjectType, silent: boolean = false): Promise<void> {
        if (objectType === KIXObjectType.TICKET) {
            return this.loadTickets(silent);
        }
    }

    public async addStorableAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        super.addStorableAdditionalInformation(contextPreference);
        contextPreference['QUEUE_ID'] = this.queueId;
        contextPreference['FILTER_VALUE'] = this.filterValue;
    }

    public async loadAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        super.loadAdditionalInformation(contextPreference);
        this.queueId = contextPreference['QUEUE_ID'];
        this.filterValue = contextPreference['FILTER_VALUE'];
    }

}
