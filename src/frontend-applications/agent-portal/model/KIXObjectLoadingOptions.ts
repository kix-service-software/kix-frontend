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

    public static clone(
        loadingOptions: KIXObjectLoadingOptions = new KIXObjectLoadingOptions()
    ): KIXObjectLoadingOptions {
        const clonedFilter = JSON.parse(JSON.stringify(loadingOptions.filter || []));
        const clonedQuery = JSON.parse(JSON.stringify(loadingOptions.query || []));
        const clonedIncludes = JSON.parse(JSON.stringify(loadingOptions.includes || []));
        const clonedExpands = JSON.parse(JSON.stringify(loadingOptions.expands || []));

        return new KIXObjectLoadingOptions(
            clonedFilter, loadingOptions.sortOrder, loadingOptions.limit, clonedIncludes, clonedExpands,
            clonedQuery, loadingOptions.cacheType, loadingOptions.searchLimit
        );
    }

}
