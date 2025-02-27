/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FilterCriteria } from '../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { Macro } from '../../model/Macro';
import { MacroProperty } from '../../model/MacroProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { Table } from '../../../table/model/Table';
import { TableContentProvider } from '../../../table/webapp/core/TableContentProvider';
import { RowObject } from '../../../table/model/RowObject';

export class MacroTableContentProvider extends TableContentProvider<Macro> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        if (!loadingOptions) {
            loadingOptions = new KIXObjectLoadingOptions();
        }

        const scopeFilter = [
            new FilterCriteria(
                MacroProperty.SCOPE, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, 'Ruleset'
            )
        ];

        if (Array.isArray(loadingOptions.filter)) {
            loadingOptions.filter.push(...scopeFilter);
        } else {
            loadingOptions.filter = scopeFilter;
        }

        if (!Array.isArray(loadingOptions.includes)) {
            loadingOptions.includes = [];
        }

        loadingOptions.includes.push(MacroProperty.ACTIONS);

        super(KIXObjectType.MACRO, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<RowObject<Macro>[]> {
        const macros = await super.loadData();

        const rootMacros = macros.filter((m) => {
            const macroId = m.getObject()?.ID;
            const hasParent = macros.some((sm) => {
                const actions = sm.getObject()?.Actions || [];
                return actions.filter((a) => a.Type === 'ExecuteMacro')
                    .some((a) => a.Parameters?.MacroID === macroId);
            });
            return !hasParent;
        });

        return rootMacros;
    }

}
