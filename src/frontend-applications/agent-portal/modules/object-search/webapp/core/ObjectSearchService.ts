/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { ObjectSearch } from '../../model/ObjectSearch';

export class ObjectSearchService extends KIXObjectService {

    private static INSTANCE: ObjectSearchService;

    public static getInstance(): ObjectSearchService {
        if (!ObjectSearchService.INSTANCE) {
            ObjectSearchService.INSTANCE = new ObjectSearchService();
        }
        return ObjectSearchService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.OBJECT_SEARCH);
        this.objectConstructors.set(KIXObjectType.OBJECT_SEARCH, [ObjectSearch]);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.OBJECT_SEARCH;
    }

    public getLinkObjectName(): string {
        return '';
    }


}
