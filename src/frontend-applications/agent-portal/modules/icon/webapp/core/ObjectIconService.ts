/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
        super(KIXObjectType.OBJECT_ICON);
        this.objectConstructors.set(KIXObjectType.OBJECT_ICON, [ObjectIcon]);
        super.loadObjects<ObjectIcon>(KIXObjectType.OBJECT_ICON, null);
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: ObjectIconLoadingOptions
    ): Promise<O[]> {
        let icons = await super.loadObjects<ObjectIcon>(KIXObjectType.OBJECT_ICON, null);
        if (objectLoadingOptions && objectLoadingOptions instanceof ObjectIconLoadingOptions) {
            const icon = icons.find(
                (i) => {
                    const objectId = objectLoadingOptions?.objectId?.toString();
                    return i.ObjectID.toString() === objectId && i.Object === objectLoadingOptions.object;
                }
            );
            icons = icon ? [icon as any] : [];
        } else if (objectIds && objectIds.length) {
            icons = icons.filter((i) => objectIds.some((oid) => Number(oid) === Number(i.ID)));
        }

        return icons as any[];
    }

    public async getObjectIcon(
        object: string | KIXObjectType, objectId: string | number
    ): Promise<ObjectIcon | string> {
        const icons = await this.loadObjects(null, null, null, new ObjectIconLoadingOptions(object, objectId));
        return Array.isArray(icons) && icons.length
            ? icons[0] as any
            : null;
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.OBJECT_ICON;
    }

    public getLinkObjectName(): string {
        return 'ObjectIcon';
    }

}
