/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormInstance } from './FormInstance';

export class FormValuesChangedEventData {

    public constructor(
        public formInstance: FormInstance,
        public changedValues: Array<[FormFieldConfiguration, FormFieldValue]> = [],
        public originInstanceId: string
    ) { }

}
