/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { NotificationFilterTableProperty } from "./NotificationFilterTableProperty";
import { TableContentProvider } from "../../../../base-components/webapp/core/table/TableContentProvider";
import { ITable, IRowObject, TableValue, RowObject } from "../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { NotificationDetailsContext } from "..";
import { LabelService } from "../../../../../modules/base-components/webapp/core/LabelService";
import { TicketProperty } from "../../../../ticket/model/TicketProperty";
import { KIXObjectProperty } from "../../../../../model/kix/KIXObjectProperty";
import { ObjectIcon } from "../../../../icon/model/ObjectIcon";
import { Notification } from "../../../model/Notification";
import { ILabelProvider } from "../../../../base-components/webapp/core/ILabelProvider";
import { DynamicFieldValue } from "../../../../dynamic-fields/model/DynamicFieldValue";

export class NotificationFilterTableContentProvider extends TableContentProvider<any> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.NOTIFICATION, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<IRowObject[]> {
        const context = await ContextService.getInstance().getContext(NotificationDetailsContext.CONTEXT_ID);
        const notification = context ? await context.getObject<Notification>() : null;

        const rowObjects: IRowObject[] = [];
        if (notification && notification.Filter) {
            const ticketLabelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET);
            const articleLabelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.ARTICLE);
            const filterIterator = notification.Filter.entries();
            let filter = filterIterator.next();
            while (filter && filter.value) {
                let displayKey = filter.value[0];
                let displayValuesAndIcons = [];
                if (this.isTicketProperty(displayKey)) {
                    displayValuesAndIcons = await this.getValue(displayKey, filter.value[1], ticketLabelProvider);
                    displayKey = await ticketLabelProvider.getPropertyText(displayKey);
                } else if (displayKey.match(new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`))) {
                    displayValuesAndIcons = await this.getDFValues(displayKey, filter.value[1], ticketLabelProvider);
                    displayKey = await ticketLabelProvider.getPropertyText(displayKey);
                } else {
                    displayValuesAndIcons = await this.getValue(displayKey, filter.value[1], articleLabelProvider);
                    displayKey = await articleLabelProvider.getPropertyText(displayKey);
                }
                const displayString = displayValuesAndIcons[2] ? displayValuesAndIcons[2] :
                    Array.isArray(displayValuesAndIcons[0]) ? displayValuesAndIcons[0].join(', ') : '';
                const values: TableValue[] = [
                    new TableValue(NotificationFilterTableProperty.FIELD, filter.value[0], displayKey),
                    new TableValue(
                        NotificationFilterTableProperty.VALUE,
                        displayValuesAndIcons[0],
                        displayString,
                        null, displayValuesAndIcons[1]
                    )
                ];
                rowObjects.push(new RowObject<any>(values));
                filter = filterIterator.next();
            }
        }

        return rowObjects;
    }

    private isTicketProperty(property: string): boolean {
        let knownProperties = Object.keys(TicketProperty).map((p) => TicketProperty[p]);
        knownProperties = [...knownProperties, ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p])];
        return knownProperties.some((p) => p === property);
    }

    private async getValue(
        property: string, value: string[] | number[], labelProvider: ILabelProvider<any>
    ): Promise<[string[], Array<string | ObjectIcon>]> {
        const displayValues: string[] = [];
        const displayIcons: Array<string | ObjectIcon> = [];
        if (labelProvider) {
            if (Array.isArray(value)) {
                for (const v of value) {
                    const string = await labelProvider.getPropertyValueDisplayText(property, v);
                    if (string) {
                        displayValues.push(string);
                        const icons = await labelProvider.getIcons(null, property, v);
                        if (icons && !!icons.length) {
                            displayIcons.push(icons[0]);
                        } else {
                            displayIcons.push(null);
                        }
                    }
                }
            } else {
                displayValues.push(
                    await labelProvider.getPropertyValueDisplayText(
                        property, isNaN(Number(value)) ? value : Number(value)
                    )
                );
                const icons = await labelProvider.getIcons(null, property, value);
                if (icons && !!icons.length) {
                    displayIcons.push(icons[0]);
                } else {
                    displayIcons.push(null);
                }
            }
        }
        return [displayValues, displayIcons];
    }

    private async getDFValues(
        key: string, value: any, labelProvider: ILabelProvider<any>
    ): Promise<[string[], Array<string | ObjectIcon>, string]> {
        const dfName = key.replace(new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`), '$1');
        let displayValues: string[] = [];
        let displayString: string = '';
        if (dfName) {
            const preparedValue = await labelProvider.getDFDisplayValues(
                new DynamicFieldValue({
                    Name: dfName,
                    Value: value
                } as DynamicFieldValue)
            );
            displayValues = preparedValue ? preparedValue[0] : Array.isArray(value) ? value : [value];
            displayString = preparedValue ? preparedValue[1] : '';
        }
        return [displayValues, null, displayString];
    }
}
