/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../table/TableContentProvider";
import {
    KIXObjectType, KIXObjectLoadingOptions, TicketProperty, KIXObjectProperty, ObjectIcon, Job
} from "../../../model";
import { ITable, IRowObject, RowObject, TableValue } from "../../table";
import { ContextService } from "../../context";
import { LabelService } from "../../LabelService";
import { LabelProvider } from "../../LabelProvider";
import { JobDetailsContext } from "../context";
import { JobFilterTableProperty } from "./JobFilterTableProperty";

export class JobFilterTableContentProvider extends TableContentProvider<any> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.JOB, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<IRowObject[]> {
        const context = await ContextService.getInstance().getContext(JobDetailsContext.CONTEXT_ID);
        const job = context ? await context.getObject<Job>() : null;

        const rowObjects: IRowObject[] = [];
        if (job && job.Filter) {
            const ticketLabelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET);
            const articleLabelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.ARTICLE);
            const filterIterator = job.filterMap.entries();
            let filter = filterIterator.next();
            while (filter && filter.value) {
                let displayKey = filter.value[0];
                let displayValuesAndIcons = [];
                if (this.isTicketProperty(displayKey)) {
                    displayValuesAndIcons = await this.getValue(displayKey, filter.value[1], ticketLabelProvider);
                    displayKey = await ticketLabelProvider.getPropertyText(displayKey);
                } else {
                    displayValuesAndIcons = await this.getValue(displayKey, filter.value[1], articleLabelProvider);
                    displayKey = await articleLabelProvider.getPropertyText(displayKey);
                }
                const values: TableValue[] = [
                    new TableValue(JobFilterTableProperty.FIELD, filter.value[0], displayKey),
                    new TableValue(
                        JobFilterTableProperty.VALUE, displayValuesAndIcons[0],
                        displayValuesAndIcons[0].join(', '), null, displayValuesAndIcons[1]
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
        property: string, value: string[] | number[], labelProvider: LabelProvider
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
}
