/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon } from '../../model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { ObjectIconLoadingOptions } from '../../../../server/model/ObjectIconLoadingOptions';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';

export class ObjectIconService extends KIXObjectService<ObjectIcon> {

    private static INSTANCE: ObjectIconService = null;

    public static getInstance(): ObjectIconService {
        if (!ObjectIconService.INSTANCE) {
            ObjectIconService.INSTANCE = new ObjectIconService();
        }

        return ObjectIconService.INSTANCE;
    }

    private constructor() {
        super();
        super.loadObjects<ObjectIcon>(KIXObjectType.OBJECT_ICON, null);
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let icons = await super.loadObjects<ObjectIcon>(KIXObjectType.OBJECT_ICON, null);
        if (objectLoadingOptions && objectLoadingOptions instanceof ObjectIconLoadingOptions) {
            const icon = icons.find(
                (i) => {
                    const objectId = objectLoadingOptions.objectId
                        ? objectLoadingOptions.objectId.toString()
                        : null;
                    return i.ObjectID.toString() === objectId && i.Object === objectLoadingOptions.object;
                }
            );
            icons = icon ? [icon as any] : [];
        } else if (objectIds && objectIds.length) {
            icons = icons.filter((i) => objectIds.some((oid) => oid === i.ID));
        }

        return icons as any[];
    }

    public isServiceFor(kixObjectType: KIXObjectType | string) {
        return kixObjectType === KIXObjectType.OBJECT_ICON;
    }

    public getLinkObjectName(): string {
        return 'ObjectIcon';
    }

}
