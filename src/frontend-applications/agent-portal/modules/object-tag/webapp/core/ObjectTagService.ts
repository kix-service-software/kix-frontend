/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectTag } from '../../model/ObjectTag';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { ObjectTagLink } from '../../model/ObjectTagLink';

export class ObjectTagService extends KIXObjectService<ObjectTag> {

    private static INSTANCE: ObjectTagService = null;

    public static getInstance(): ObjectTagService {
        if (!ObjectTagService.INSTANCE) {
            ObjectTagService.INSTANCE = new ObjectTagService();
        }

        return ObjectTagService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.OBJECT_TAG);
        this.objectConstructors.set(KIXObjectType.OBJECT_TAG, [ObjectTag]);
        this.objectConstructors.set(KIXObjectType.OBJECT_TAG_LINK, [ObjectTagLink]);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.OBJECT_TAG
            || kixObjectType === KIXObjectType.OBJECT_TAG_LINK;
    }

    public getLinkObjectName(): string {
        return 'ObjectTag';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds?: boolean, silent?: boolean, collectionId?: string
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (
            objectType === KIXObjectType.OBJECT_TAG_LINK
            || objectType === KIXObjectType.OBJECT_TAG
        ) {
            objects = await super.loadObjects<O>(
                objectType, null, loadingOptions,
                objectLoadingOptions, cache, forceIds, silent, collectionId
            );
        } else {
            superLoad = true;

            objects = await super.loadObjects<O>(
                objectType, objectIds, loadingOptions,
                objectLoadingOptions, cache, forceIds, silent, collectionId
            );
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.map((id) => id).some((oid) => c.ObjectId === oid));
        }

        return objects;
    }
}
