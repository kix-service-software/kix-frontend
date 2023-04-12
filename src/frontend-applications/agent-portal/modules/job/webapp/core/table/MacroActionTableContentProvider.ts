/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Job } from '../../../model/Job';
import { MacroAction } from '../../../model/MacroAction';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { MacroActionType } from '../../../model/MacroActionType';
import { MacroActionTypeOption } from '../../../model/MacroActionTypeOption';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';

export class MacroActionTableContentProvider extends TableContentProvider<any> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.JOB, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<RowObject[]> {
        const context = ContextService.getInstance().getActiveContext();
        const job = context ? await context.getObject<Job>(KIXObjectType.MACRO_ACTION) : null;

        const rowObjectPromises: Array<Promise<RowObject<MacroAction>>> = [];
        if (job && job.Macros && job.Macros.length) {
            const actions = [...job.Macros[0].Actions];

            for (const o of actions) {
                rowObjectPromises.push(new Promise<RowObject<MacroAction>>(async (resolve, reject) => {
                    const values: TableValue[] = [];

                    const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                    for (const column of columns) {
                        const value = new TableValue(column.property, o[column.property]);
                        values.push(value);
                    }

                    o['preparedParameters'] = await this.getPreparedParameters(o, job.Macros[0].Type);

                    await this.prepareSpecificValues(values, o);

                    resolve(new RowObject<MacroAction>(values, o));
                }));
            }
        }

        const rowObjects = await Promise.all(rowObjectPromises);
        return rowObjects;
    }

    private async getPreparedParameters(o: MacroAction, macroType: string): Promise<any> {
        let preparedParameters = {};
        const actionTypes = await KIXObjectService.loadObjects<MacroActionType>(
            KIXObjectType.MACRO_ACTION_TYPE, [o.Type], undefined, { id: macroType }, true
        ).catch(() => [] as MacroActionType[]);

        if (actionTypes && actionTypes[0]) {
            for (const parameter in o.Parameters) {
                if (actionTypes[0].Options[parameter]) {
                    const option = actionTypes[0].Options[parameter] as MacroActionTypeOption;
                    if (option) {
                        const translated = await TranslationService.translate(option.Label);
                        preparedParameters[translated] = Array.isArray(o.Parameters[parameter])
                            ? JSON.stringify(o.Parameters[parameter]) : o.Parameters[parameter];
                    }
                }
            }
        } else {
            preparedParameters = o.Parameters;
        }
        return preparedParameters;
    }
}
