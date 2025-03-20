/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FilterDataType } from './FilterDataType';
import { FilterType } from './FilterType';
import { SearchOperator } from '../modules/search/model/SearchOperator';

export class FilterCriteria {

    public constructor(
        public property: string,
        public operator: SearchOperator | string,
        public type: FilterDataType,
        public filterType: FilterType,
        public value: string | number | string[] | number[]
    ) { }

}
