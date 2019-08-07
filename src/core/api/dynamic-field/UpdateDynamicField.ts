/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestObject } from '../RequestObject';

export class UpdateDynamicField extends RequestObject {

    public DynamicField: any;

    public constructor(
        name: string = null, label: string = null, fieldType: string = null,
        objectType: string = null, validId: number = null, config: any = null
    ) {
        super();

        this.applyProperty('Name', name);
        this.applyProperty('Label', label);
        this.applyProperty('FieldType', fieldType);
        this.applyProperty('ObjectType', objectType);
        this.applyProperty('ValidID', validId);
        this.applyProperty('Config', config);
    }

}
