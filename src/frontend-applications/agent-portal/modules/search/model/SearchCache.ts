/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
    private originalPrimaryValue: string;
    private originalLimit: number;

    public constructor(
        public id: string,
        public contextId: string,
        public objectType: KIXObjectType | string,
        public criteria: FilterCriteria[],
        public result: T[],
        public fulltextValue: string = null,
        public primaryValue: string = null,
        public name: string = '',
        public limit: number = null,
        public sortAttribute: string = null,
        public sortDescending: boolean = false,
        public userId?: number,
        public userDisplayText?: string
    ) {
        if (!id) {
            this.id = IdService.generateDateBasedId('SearchCache');
        }

        this.originalCriteria = Array.isArray(this.criteria)
            ? [...this.criteria]
            : [];
        this.originalFulltextValue = this.fulltextValue;
        this.originalPrimaryValue = this.primaryValue;
        this.originalLimit = this.limit;
    }

    public reset(): void {
        this.criteria = [...this.originalCriteria];
        this.result = [];
        this.fulltextValue = this.originalFulltextValue;
        this.primaryValue = this.originalPrimaryValue;
        this.limit = this.originalLimit;
        this.name = '';
        this.sortAttribute = null;
        this.sortDescending = false;
    }

    public static create(searchCache: SearchCache, createNew?: boolean): SearchCache {
        const id = createNew ? IdService.generateDateBasedId('SearchCache') : searchCache?.id;
        return new SearchCache(
            id, searchCache.contextId,
            searchCache.objectType, searchCache.criteria || [], [],
            searchCache.fulltextValue, searchCache.primaryValue, searchCache.name,
            searchCache.limit, searchCache.sortAttribute, searchCache.sortDescending,
            searchCache.userId, searchCache.userDisplayText
        );
    }

    public async setCriteria(criteria: FilterCriteria[] = []): Promise<void> {
        const searchDefinition = SearchService.getInstance().getSearchDefinition(this.objectType);
        this.criteria = await searchDefinition?.prepareFormFilterCriteria(criteria, false);
    }

}
