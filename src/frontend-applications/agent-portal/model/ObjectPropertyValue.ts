/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SearchOperator } from '../modules/search/model/SearchOperator';
import { KIXObject } from './kix/KIXObject';
import { KIXObjectType } from './kix/KIXObjectType';
import { IdService } from './IdService';
import { ObjectPropertyValueOption } from './ObjectPropertyValueOption';
import { FormFieldOption } from './configuration/FormFieldOption';

export class ObjectPropertyValue {

    public constructor(
        public property: string,
        public operator: SearchOperator | string,
        public value: string | number | string[] | number[] | KIXObject | any,
        public options: ObjectPropertyValueOption[] = [],
        public required: boolean = false,
        public valid: boolean = true,
        public objectType: KIXObjectType | string = null,
        public readonly: boolean = false,
        public changeable: boolean = true,
        public id: string = IdService.generateDateBasedId('value-'),
        public additionalOptions: FormFieldOption[] = null
    ) { }

}
