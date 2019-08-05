/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject, KIXObjectType } from "../../model";

export interface IContextListener {

    sidebarToggled(): void;

    explorerBarToggled(): void;

    objectChanged(
        objectId: string | number, object: KIXObject | any, type: KIXObjectType, changedProperties?: string[]
    ): void;

    objectListChanged(objectList: KIXObject[]): void;

    filteredObjectListChanged(objectList: KIXObject[]): void;

    scrollInformationChanged(objectType: KIXObjectType, objectId: string | number): void;

}
