/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXIcon } from '../../model/KIXIcon';
import { FontawesomeIcon } from '../../model/FontawesomeIcon';

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
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: ObjectIconLoadingOptions,
        cache: boolean = true, forceIds?: boolean, silent?: boolean, collectionId?: string
    ): Promise<O[]> {
        let icons = await super.loadObjects<ObjectIcon>(
            KIXObjectType.OBJECT_ICON, undefined, undefined, undefined, undefined, undefined, undefined, collectionId
        );

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

    public async getAvailableIcons(
        kixFont: boolean = true, fontAwesome: boolean = true, kixIcons: boolean = true
    ): Promise<Array<ObjectIcon | string>> {
        const icons = [];

        if (kixFont) {
            for (const [key, value] of Object.entries(KIXIcon.icons)) {
                icons.push(key);
            }
        }

        if (fontAwesome) {
            for (const [key, value] of Object.entries(FontawesomeIcon.icons)) {
                icons.push(key);
            }
        }

        if (kixIcons) {
            const objectIcons = await this.loadObjects<ObjectIcon>(KIXObjectType.OBJECT_ICON, null)
                .catch((): ObjectIcon[] => []);
            icons.push(...objectIcons);
        }

        return icons;
    }

}
