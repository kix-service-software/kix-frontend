/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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
        public additionalOptions: FormFieldOption[] = null,
        public validErrorMessages: string[] = [],
        public hint: string = '',
        public locked?: boolean,
        public valueChangeable?: boolean,
        public reloadValueTree?: boolean
    ) { }

}
