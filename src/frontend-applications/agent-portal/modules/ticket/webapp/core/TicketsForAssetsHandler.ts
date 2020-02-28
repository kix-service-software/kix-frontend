/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IObjectReferenceHandler } from "../../../base-components/webapp/core/IObjectReferenceHandler";
import { Ticket } from "../../model/Ticket";
import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { TicketProperty } from "../../model/TicketProperty";
import { FormService } from "../../../base-components/webapp/core/FormService";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { DynamicFormFieldOption } from "../../../dynamic-fields/webapp/core";

export class TicketsForAssetsHandler implements IObjectReferenceHandler {

    public name: string = 'TicketsForAssetsHandler';

    public objectType: KIXObjectType = KIXObjectType.TICKET;

    public async determineObjects(ticket: Ticket, config: any): Promise<Ticket[]> {
        let tickets = [];
        if (ticket && ticket.DynamicFields) {
            if (config && config.properties && Array.isArray(config.properties)) {
                const filter = this.prepareFilter(ticket, config.properties);
                if (filter && filter.length) {
                    filter.push(new FilterCriteria(
                        TicketProperty.TICKET_ID, SearchOperator.NOT_EQUALS,
                        FilterDataType.NUMERIC, FilterType.AND, ticket.TicketID
                    ));
                    const loadingOptions = new KIXObjectLoadingOptions(
                        filter, null, null, [KIXObjectProperty.DYNAMIC_FIELDS]
                    );
                    tickets = await KIXObjectService.loadObjects<Ticket>(KIXObjectType.TICKET, null, loadingOptions)
                        .catch(() => []);
                }
            }
        }
        return tickets;
    }

    private prepareFilter(ticket: Ticket, properties: string): FilterCriteria[] {
        const filter: FilterCriteria[] = [];
        for (const p of properties) {
            const values = this.getDynamicFieldValues(ticket, p);
            if (values && values.length) {
                filter.push(new FilterCriteria(
                    p, SearchOperator.IN, FilterDataType.NUMERIC, FilterType.OR, values
                ));
            }
        }
        return filter;
    }

    private getDynamicFieldValues(ticket: Ticket, property: string): number[] {
        let values: number[];
        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (ticket && ticket.DynamicFields && dfName) {
            const dynamicField = ticket.DynamicFields.find((df) => df.Name === dfName);
            if (dynamicField && dynamicField.Value && Array.isArray(dynamicField.Value) && dynamicField.Value.length) {
                values = dynamicField.Value.map((v) => Number(v));
            }
        }

        return values;
    }

    public async determineObjectsByForm(formId: string, ticket: Ticket, config: any): Promise<Ticket[]> {
        let tickets = [];
        if (config && config.properties && Array.isArray(config.properties)) {
            const formInstance = await FormService.getInstance().getFormInstance(formId);
            const filter: FilterCriteria[] = [];
            for (const p of config.properties) {
                const formField = await formInstance.getFormFieldByProperty(p);
                if (formField) {
                    const value = await formInstance.getFormFieldValueByProperty(p);
                    if (value && value.value && Array.isArray(value.value) && value.value.length) {
                        filter.push(new FilterCriteria(
                            p, SearchOperator.IN, FilterDataType.NUMERIC, FilterType.OR, value.value
                        ));
                    }
                } else {
                    const values = this.getDynamicFieldValues(ticket, p);
                    if (values && values.length) {
                        filter.push(new FilterCriteria(
                            p, SearchOperator.IN, FilterDataType.NUMERIC, FilterType.OR, values
                        ));
                    }
                }
            }

            if (filter && filter.length) {
                filter.push(new FilterCriteria(
                    TicketProperty.TICKET_ID, SearchOperator.NOT_EQUALS,
                    FilterDataType.NUMERIC, FilterType.AND, ticket.TicketID
                ));
                const loadingOptions = new KIXObjectLoadingOptions(
                    filter, null, null, [KIXObjectProperty.DYNAMIC_FIELDS]
                );
                tickets = await KIXObjectService.loadObjects<Ticket>(KIXObjectType.TICKET, null, loadingOptions)
                    .catch(() => []);
            }

        }
        return tickets;
    }

    public isPossibleFormField(formField: FormFieldConfiguration, config: any): boolean {
        if (formField && config && config.properties && Array.isArray(config.properties)) {
            if (formField.property === KIXObjectProperty.DYNAMIC_FIELDS) {
                const dfNameOption = formField.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
                if (dfNameOption) {
                    config.properties.some((p) => p === 'DynamicFields.' + dfNameOption.value);
                }
            }

            return config.properties.some((p) => p === formField.property);
        }

        return false;
    }

}
