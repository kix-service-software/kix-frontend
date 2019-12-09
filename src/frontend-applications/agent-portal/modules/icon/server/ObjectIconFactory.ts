/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFactory } from "../../../server/model/ObjectFactory";
import { ObjectIcon } from "../model/ObjectIcon";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";

export class ObjectIconFactory extends ObjectFactory<ObjectIcon> {

    public isFactoryFor(objectType: KIXObjectType | string): boolean {
        return objectType === KIXObjectType.OBJECT_ICON;
    }

    public async create(icon?: ObjectIcon): Promise<ObjectIcon> {
        return new ObjectIcon(undefined, undefined, undefined, undefined, icon);
    }

}
