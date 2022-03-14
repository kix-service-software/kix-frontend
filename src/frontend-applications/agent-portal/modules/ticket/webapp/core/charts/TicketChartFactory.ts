/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketProperty } from '../../../model/TicketProperty';
import { Ticket } from '../../../model/Ticket';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { TicketStateProperty } from '../../../model/TicketStateProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { DateTimeUtil } from '../../../../../modules/base-components/webapp/core/DateTimeUtil';
import { SysConfigService } from '../../../../sysconfig/webapp/core';


export class TicketChartFactory {

    private static INSTANCE: TicketChartFactory;

    public static getInstance(): TicketChartFactory {
        if (!TicketChartFactory.INSTANCE) {
            TicketChartFactory.INSTANCE = new TicketChartFactory();
        }
        return TicketChartFactory.INSTANCE;
    }

    private constructor() { }

    public async prepareData(property: TicketProperty, tickets: Ticket[] = []): Promise<Map<string, number>> {
        switch (property) {
            case TicketProperty.STATE_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.QUEUE_ID:
            case TicketProperty.TYPE_ID:
                return this.preparePropertyCountData(property, tickets);
            case TicketProperty.CREATED:
                return this.prepareCreatedData(property, tickets);
            default:
                return new Map();
        }
    }

    private async preparePropertyCountData(property: TicketProperty, tickets: Ticket[]): Promise<Map<string, number>> {
        const data = await this.initMap(property);

        const ids = tickets.map((t) => t[property]);

        const labels: Map<string, string> = new Map();

        for (const id of ids) {
            if (!labels.has(id)) {
                const label = await LabelService.getInstance().getPropertyValueDisplayText(
                    KIXObjectType.TICKET, property, id
                );
                labels.set(id, label);
            }

            const label = labels.get(id);

            if (!data.has(label)) {
                data.set(label, 0);
            }

            data.set(label, data.get(label) + 1);
        }

        return data;
    }

    private async initMap(property: TicketProperty): Promise<Map<string, number>> {
        const map = new Map<string, number>();
        let objectType: KIXObjectType;
        let filter = [];
        switch (property) {
            case TicketProperty.PRIORITY_ID:
                objectType = KIXObjectType.TICKET_PRIORITY;
                break;
            case TicketProperty.STATE_ID:
                objectType = KIXObjectType.TICKET_STATE;

                const stateTypes = await SysConfigService.getInstance().getTicketViewableStateTypes();

                if (stateTypes && !!stateTypes.length) {
                    filter = [new FilterCriteria(
                        TicketStateProperty.TYPE_NAME, SearchOperator.IN, FilterDataType.STRING,
                        FilterType.AND, stateTypes
                    )];
                }
                break;
            case TicketProperty.QUEUE_ID:
                objectType = KIXObjectType.QUEUE;
                break;
            case TicketProperty.TYPE_ID:
                objectType = KIXObjectType.TICKET_TYPE;
                break;

            default:
        }

        const objects = await KIXObjectService.loadObjects(objectType, null, new KIXObjectLoadingOptions(filter));

        for (const o of objects) {
            const label = await LabelService.getInstance().getPropertyValueDisplayText(
                KIXObjectType.TICKET, property, o.ObjectId
            );
            map.set(label, 0);
        }
        return map;
    }

    private async prepareCreatedData(property: TicketProperty, tickets: Ticket[]): Promise<Map<string, number>> {
        const data = new Map<string, number>();
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 8);
        for (let i = 1; i <= 8; i++) {
            currentDate.setDate(currentDate.getDate() + 1);
            const label = await DateTimeUtil.getLocalDateString(currentDate);
            const createdTickets = tickets.filter((t) => DateTimeUtil.sameDay(currentDate, new Date(t.Created)));
            data.set(label, createdTickets.length);
        }
        return data;
    }

}
