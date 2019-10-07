/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PropertyOperator } from "./PropertyOperator";
import { IdService } from "../browser";
import { KIXObject, KIXObjectType } from "../model";
import { ImportPropertyOperator } from "./import";
import { SearchOperator } from "./SearchOperator";

export class ObjectPropertyValue {

    public constructor(
        public property: string,
        public operator: SearchOperator | PropertyOperator | ImportPropertyOperator | string,
        public value: string | number | string[] | number[] | KIXObject | any,
        public required: boolean = false,
        public valid: boolean = true,
        public objectType: KIXObjectType = null,
        public readonly: boolean = false,
        public changeable: boolean = true,
        public id: string = IdService.generateDateBasedId('value-')
    ) { }

}
