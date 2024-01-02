/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
