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
    KIXObjectType, KIXObjectLoadingOptions, Job
} from "../../../model";
import { ITable, IRowObject, RowObject, TableValue } from "../../table";
import { ContextService } from "../../context";
import { JobDetailsContext } from "../context";
import { MacroAction, MacroActionProperty } from "../../../model/kix/macro";

export class MacroActionTableContentProvider extends TableContentProvider<any> {

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
        const job = context ? await context.getObject<Job>(KIXObjectType.MACRO_ACTION) : null;

        const rowObjectPromises: Array<Promise<RowObject<MacroAction>>> = [];
        if (job && job.Macros && job.Macros.length) {
            const actions = job.Macros[0].Actions;

            for (const o of actions) {
                rowObjectPromises.push(new Promise<RowObject<MacroAction>>(async (resolve, reject) => {
                    const values: TableValue[] = [];

                    for (const property in o) {
                        if (o.hasOwnProperty(property)) {
                            const value = await this.getTableValue(o, property);
                            values.push(value);
                        }
                    }
                    await this.addSpecificValues(values, o);

                    resolve(new RowObject<MacroAction>(values, o));
                }));
            }
        }

        const rowObjects = await Promise.all(rowObjectPromises);
        return rowObjects;
    }
}