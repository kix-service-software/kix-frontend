/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class DynamicFieldType extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: string = KIXObjectType.DYNAMIC_FIELD_TYPE;

    public DisplayName: string;

    public Name: string;

    public constructor(dynamicFieldType?: DynamicFieldType) {
        super(dynamicFieldType);
        if (dynamicFieldType) {
            this.ObjectId = dynamicFieldType.Name;
            this.DisplayName = dynamicFieldType.DisplayName;
            this.Name = dynamicFieldType.Name;
        }
    }

}
