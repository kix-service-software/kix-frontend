/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FilterCriteria } from './FilterCriteria';

export class KIXObjectLoadingOptions {

    public constructor(
        public filter?: FilterCriteria[],
        public sortOrder?: string,
        public limit?: number,
        public includes?: string[],
        public expands?: string[],
        public query?: Array<[string, string]>,
        public cacheType?: string,
        public searchLimit?: number
    ) { }

}
