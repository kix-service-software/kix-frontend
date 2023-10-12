/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { SysConfigOptionDefinition } from '../../../model/SysConfigOptionDefinition';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { SysConfigOption } from '../../../model/SysConfigOption';
import { SysConfigKey } from '../../../model/SysConfigKey';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SysConfigOptionDefinitionProperty } from '../../../model/SysConfigOptionDefinitionProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { AdminContext } from '../../../../admin/webapp/core/AdminContext';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';

export class SysConfigTableContentProvider extends TableContentProvider<SysConfigOptionDefinition> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<SysConfigOptionDefinition>>> {

        const configLevel = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.CONFIG_LEVEL]
        );

        let loadingOptions: KIXObjectLoadingOptions;
        if (configLevel && !!configLevel.length) {
            const definitionFilter = [
                new FilterCriteria(
                    SysConfigOptionDefinitionProperty.EXPERIENCE_LEVEL, SearchOperator.GREATER_THAN_OR_EQUAL,
                    FilterDataType.NUMERIC, FilterType.OR, Number(configLevel[0].Value)
                ),
                new FilterCriteria(
                    SysConfigOptionDefinitionProperty.EXPERIENCE_LEVEL, SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.OR, null
                ),
            ];
            loadingOptions = new KIXObjectLoadingOptions(definitionFilter);
        }

        const sysConfigDefinitions = await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, null, this.loadingOptions ? this.loadingOptions : loadingOptions
        );

        const rowObjects = [];
        const definitions = sysConfigDefinitions.filter(
            (scd) => scd.Name !== AdminContext.CONTEXT_ID && scd.Name !== 'admin-dashboard-category-explorer'
        );

        for (const scd of definitions) {
            const rowObject = await this.createRowObject(scd);
            rowObjects.push(rowObject);
        }

        return rowObjects;
    }

    private async createRowObject(definition: SysConfigOptionDefinition): Promise<RowObject> {
        const values: TableValue[] = [];

        const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
        for (const column of columns) {
            const tableValue = new TableValue(column.property, definition[column.property]);
            values.push(tableValue);
        }

        const rowObject = new RowObject<SysConfigOptionDefinition>(values, definition);

        return rowObject;
    }
}
