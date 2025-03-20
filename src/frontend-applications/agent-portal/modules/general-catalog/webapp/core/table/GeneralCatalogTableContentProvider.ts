/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { Table } from '../../../../table/model/Table';

export class GeneralCatalogTableContentProvider extends TableContentProvider<GeneralCatalogItem> {

    private gcSort: [string, boolean];
    private gcFilter: string;

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.GENERAL_CATALOG_ITEM, table, objectIds, loadingOptions, contextId);
        this.useBackendSort = true;
        this.useBackendFilter = true;
    }

    protected async prepareLoadingOptions(): Promise<KIXObjectLoadingOptions> {

        const loadingOptions = await super.prepareLoadingOptions();
        let hasClassFilter = false;

        if (
            loadingOptions?.filter
            && loadingOptions?.filter?.length
        ) {
            hasClassFilter = loadingOptions?.filter.some(
                (f) =>
                    f.property === GeneralCatalogItemProperty.CLASS && f.value === 'ITSM::ConfigItem::Class'
            );
        }

        if (!hasClassFilter) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    GeneralCatalogItemProperty.CLASS, SearchOperator.NOT_EQUALS,
                    FilterDataType.STRING, FilterType.AND, 'ITSM::ConfigItem::Class'
                )
            );
        }

        return loadingOptions;
    }
}
