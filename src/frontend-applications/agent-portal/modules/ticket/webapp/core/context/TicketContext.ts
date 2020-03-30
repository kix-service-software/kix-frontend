/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../model/Context";
import { FilterCriteria } from "../../../../../model/FilterCriteria";
import { TicketProperty } from "../../../model/TicketProperty";
import { SearchOperator } from "../../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../../model/FilterDataType";
import { FilterType } from "../../../../../model/FilterType";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { EventService } from "../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../modules/base-components/webapp/core/ApplicationEvent";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { KIXObjectProperty } from "../../../../../model/kix/KIXObjectProperty";
import { ContextUIEvent } from "../../../../base-components/webapp/core/ContextUIEvent";

export class TicketContext extends Context {

    public static CONTEXT_ID: string = 'tickets';

    public queueId: number;

    public getIcon(): string {
        return 'kix-icon-ticket';
    }

    public async getDisplayText(): Promise<string> {
        return 'Ticket Dashboard';
    }

    public async setQueue(queueId: number): Promise<void> {
        if (queueId) {
            if (queueId !== this.queueId) {
                this.queueId = queueId;
                await this.loadTickets();
            }
        } else if (this.queueId || typeof this.queueId === 'undefined') {
            this.queueId = null;
            await this.loadTickets();
        }
    }

    private async loadTickets(): Promise<void> {
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS, KIXObjectType.TICKET);
        const stateTypeFilterCriteria = new FilterCriteria(
            TicketProperty.STATE_TYPE, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Open'
        );

        const loadingOptions = new KIXObjectLoadingOptions(
            [stateTypeFilterCriteria], null, 1000, [TicketProperty.WATCHERS, KIXObjectProperty.DYNAMIC_FIELDS]
        );

        if (this.queueId) {
            const queueFilter = new FilterCriteria(
                TicketProperty.QUEUE_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, this.queueId
            );
            loadingOptions.filter.push(queueFilter);
        }

        const tickets = await KIXObjectService.loadObjects(
            KIXObjectType.TICKET, null, loadingOptions, null, false
        ).catch((error) => []);

        this.setObjectList(KIXObjectType.TICKET, tickets);
        this.setFilteredObjectList(KIXObjectType.TICKET, tickets);

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
    }

    public reset(): void {
        super.reset();
        this.queueId = null;
        this.loadTickets();
    }

    public reloadObjectList(objectType: KIXObjectType): Promise<void> {
        if (objectType === KIXObjectType.TICKET) {
            return this.loadTickets();
        }
    }

}
