/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestObject } from '../RequestObject';

export class CreateDynamicField extends RequestObject {

    public constructor(
        name: string, label: string, fieldType: string, objectType: string,
        internalField: number = null, validID: number = null, config: any = null
    ) {
        super();
        this.applyProperty('Name', name);
        this.applyProperty('Label', label);
        this.applyProperty('FieldType', fieldType);
        this.applyProperty('ObjectType', objectType);
        this.applyProperty('InternalField', internalField);
        this.applyProperty('ValidID', validID);
        this.applyProperty('Config', config);
    }

}
