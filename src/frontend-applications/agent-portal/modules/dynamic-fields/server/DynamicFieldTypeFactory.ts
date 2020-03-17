/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFactory } from "../../../server/model/ObjectFactory";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { DynamicFieldType } from "../model/DynamicFieldType";


export class DynamicFieldTypeFactory extends ObjectFactory<DynamicFieldType> {

    public isFactoryFor(objectType: KIXObjectType | string): boolean {
        return objectType === KIXObjectType.DYNAMIC_FIELD_TYPE;
    }

    public async create(dynamicFieldType?: DynamicFieldType): Promise<DynamicFieldType> {
        return new DynamicFieldType(dynamicFieldType);
    }

}
