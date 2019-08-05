/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class ValidObject extends KIXObject<ValidObject> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.VALID_OBJECT;

    public Name: string;

    public ID: number;

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
