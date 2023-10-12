/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../model/kix/KIXObject';
import { ObjectIcon } from '../../modules/icon/model/ObjectIcon';
import { KIXObjectAPIService } from './KIXObjectAPIService';

export class KIXObjectInitializer {

    public static async initDisplayValuesAndIcons(
        token: string, objects: KIXObject[], objectService: KIXObjectAPIService
    ): Promise<void> {

        const propertyValueMap: Map<string, Map<any, string>> = new Map();
        const propertyIconsMap: Map<string, Map<any, Array<ObjectIcon | string>>> = new Map();

        for (const object of objects) {

            if (typeof object !== 'object') {
                continue;
            }

            object.displayValues = [];
            object.displayIcons = [];

            for (const p in object) {
                if (Object.prototype.hasOwnProperty.call(object, p)) {
                    if (!propertyValueMap.has(p)) {
                        propertyValueMap.set(p, new Map());
                        propertyIconsMap.set(p, new Map());
                    }

                    if (!propertyValueMap.get(p).has(object[p])) {
                        const value = await objectService.getPropertyValue(token, object, p).catch(() => undefined);
                        const icons = await objectService.getPropertyIcons(token, object, p).catch(() => undefined);
                        propertyValueMap.get(p).set(object[p], value);
                        propertyIconsMap.get(p).set(object[p], icons);
                    }

                    const displayValue = propertyValueMap.get(p).get(object[p]);
                    if (displayValue) {
                        object.displayValues.push([p, displayValue]);
                    }

                    const displayIcons = propertyIconsMap.get(p).get(object[p]);
                    if (displayIcons) {
                        object.displayIcons.push([p, displayIcons]);
                    }
                }
            }
        }
    }

}