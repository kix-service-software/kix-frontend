/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
        kixFont: boolean = true, fontAwesome: boolean = true, kixIcons: boolean = true,
        filterValue?: string, iconLimit: number = 50
    ): Promise<Array<ObjectIcon | string>> {
        let icons = [];

        if (kixFont) {
            for (const [key, value] of Object.entries(KIXIcon.icons)) {
                icons.push(key);
            }
        }

        if (fontAwesome) {
            for (const key of FontawesomeIcon.getIcons()) {
                icons.push(key);
            }
        }

        if (kixIcons) {
            const loadingOptions = new KIXObjectLoadingOptions([], null, iconLimit);
            const objectIcons = await this.loadObjects<ObjectIcon>(KIXObjectType.OBJECT_ICON, null, loadingOptions)
                .catch((): ObjectIcon[] => []);
            icons.push(...objectIcons);
        }

        if (filterValue) {
            filterValue = filterValue.toLocaleLowerCase();
            icons = icons.filter((i) => {
                let match = false;

                if (typeof i === 'string') {
                    match = i.indexOf(filterValue) !== -1;
                } else if (i instanceof ObjectIcon) {
                    const objectMatch = i.Object?.toLocaleLowerCase().indexOf(filterValue) !== -1;
                    const idMatch = i.ObjectID?.toString()?.toLocaleLowerCase().indexOf(filterValue) !== -1;
                    match = objectMatch || idMatch;
                }

                return match;
            });
        }


        return icons.slice(0, iconLimit);
    }

}
