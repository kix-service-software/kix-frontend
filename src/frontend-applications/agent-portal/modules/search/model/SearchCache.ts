/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { IdService } from '../../../model/IdService';
import { SearchService } from '../webapp/core';

export class SearchCache<T extends KIXObject = KIXObject> {

    private originalCriteria: FilterCriteria[];
    private originalFulltextValue: string;
    private originalLimit: number;

    public constructor(
        public id: string,
        public contextId: string,
        public objectType: KIXObjectType | string,
        public criteria: FilterCriteria[],
        public result: T[],
        public fulltextValue: string = null,
        public name: string = '',
        public limit: number = 50
    ) {
        if (!id) {
            this.id = IdService.generateDateBasedId('SearchCache');
        }

        this.originalCriteria = [...this.criteria];
        this.originalFulltextValue = this.fulltextValue;
        this.originalLimit = this.limit;
    }

    public reset(): void {
        this.criteria = [...this.originalCriteria];
        this.result = [];
        this.fulltextValue = this.originalFulltextValue;
        this.limit = this.originalLimit;
        this.name = '';
    }

    public static create(searchCache: SearchCache): SearchCache {
        return new SearchCache(
            searchCache.id, searchCache.contextId,
            searchCache.objectType, searchCache.criteria, [], searchCache.fulltextValue,
            searchCache.name, searchCache.limit
        );
    }

    public async setCriteria(criteria: FilterCriteria[] = []): Promise<void> {
        const searchDefinition = SearchService.getInstance().getSearchDefinition(this.objectType);
        this.criteria = await searchDefinition?.prepareFormFilterCriteria(criteria);
    }

}
