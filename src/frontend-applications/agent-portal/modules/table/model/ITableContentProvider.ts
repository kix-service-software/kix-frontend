/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RowObject } from './RowObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { SortOrder } from '../../../model/SortOrder';
import { FilterCriteria } from '../../../model/FilterCriteria';

export interface ITableContentProvider<T = any> {

    totalCount: number;
    currentLimit: number;

    usePaging: boolean;

    initialize(): Promise<void>;

    getObjectType(): KIXObjectType | string;

    loadData(): Promise<Array<RowObject<T>>>;

    getRowObjects(objects: T[]): Promise<RowObject[]>;

    destroy(): void;

    loadMore(): Promise<void>;

    setSort(property: string, direction: SortOrder, reload?: boolean): Promise<void>;

    isBackendSortSupported(): boolean

    isBackendSortSupportedForProperty(property: string, dep?: string): Promise<boolean>;

    setFilter(criteria: FilterCriteria[], reload?: boolean): Promise<void>;

    isBackendFilterSupported(): boolean

    isBackendFilterSupportedForProperty(property: string, dep?: string): Promise<boolean>;

}
