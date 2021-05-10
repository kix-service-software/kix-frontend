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
import { CacheState } from './CacheState';
import { IdService } from '../../../model/IdService';

export class SearchCache<T extends KIXObject = KIXObject> {

    public constructor(
        public id: string,
        public objectType: KIXObjectType | string,
        public criteria: FilterCriteria[],
        public result: T[],
        public fulltextValue: string = null,
        public status: CacheState = CacheState.VALID,
        public name: string = '',
        public limit: number = 50
    ) {
        if (!id) {
            this.id = IdService.generateDateBasedId('SearchCache');
        }
    }

}
