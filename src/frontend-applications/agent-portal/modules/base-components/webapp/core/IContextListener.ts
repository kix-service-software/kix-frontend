/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export interface IContextListener {

    sidebarRightToggled(): void;

    sidebarLeftToggled(): void;

    objectChanged(
        objectId: string | number, object: KIXObject | any, type: KIXObjectType | string, changedProperties?: string[]
    ): void;

    objectListChanged(objectType: KIXObjectType | string, objectList: KIXObject[]): void;

    filteredObjectListChanged(objectType: KIXObjectType | string, objectList: KIXObject[]): void;

    scrollInformationChanged(objectType: KIXObjectType | string, objectId: string | number): void;

    additionalInformationChanged(key: string, value: any): void;

}
