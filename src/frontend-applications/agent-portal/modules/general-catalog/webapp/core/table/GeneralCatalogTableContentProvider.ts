/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { GeneralCatalogItem } from '../../../model/GeneralCatalogItem';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { GeneralCatalogItemProperty } from '../../../model/GeneralCatalogItemProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';

export class GeneralCatalogTableContentProvider extends TableContentProvider<GeneralCatalogItem> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.GENERAL_CATALOG_ITEM, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<GeneralCatalogItem>>> {

        const definitionFilter = [
            new FilterCriteria(
                GeneralCatalogItemProperty.CLASS, SearchOperator.NOT_EQUALS,
                FilterDataType.STRING, FilterType.AND, 'ITSM::ConfigItem::Class'
            ),
        ];
        const loadingOptions = new KIXObjectLoadingOptions(definitionFilter);

        const sysConfigOptions = await KIXObjectService.loadObjects<GeneralCatalogItem>(
            KIXObjectType.GENERAL_CATALOG_ITEM, null, this.loadingOptions ? this.loadingOptions : loadingOptions
        );

        const rowObjects = [];
        for (const fc of sysConfigOptions) {
            const row = await this.createRowObject(fc);
            rowObjects.push(row);
        }

        return rowObjects;
    }

    private async createRowObject(definition: GeneralCatalogItem): Promise<RowObject> {
        const values: TableValue[] = [];

        const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
        for (const column of columns) {
            const tableValue = new TableValue(column.property, definition[column.property]);
            values.push(tableValue);
        }

        const rowObject = new RowObject<GeneralCatalogItem>(values, definition);

        return rowObject;
    }
}
