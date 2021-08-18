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

export class ValidObject extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.VALID_OBJECT;

    public Name: string;

    public ID: number;

    static readonly VALID: number = 1;
    static readonly INVALID: number = 2;
    static readonly INVALID_TEMPORARILY: number = 3;

    public constructor(validObject?: ValidObject) {
        super(validObject);
        if (validObject) {
            this.ID = Number(validObject.ID);
            this.ObjectId = this.ID;
            this.Name = validObject.Name;
        }
    }

    public equals(object: ValidObject): boolean {
        return object.ID === this.ID;
    }

}
