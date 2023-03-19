/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SearchOperator } from '../modules/search/model/SearchOperator';

export class UIFilterCriterion {

    public constructor(
        public property: string,
        public operator: SearchOperator,
        public value: string | number | string[] | number[],
        public useObjectService: boolean = false,
        public useDisplayValue: boolean = false
    ) { }

}
