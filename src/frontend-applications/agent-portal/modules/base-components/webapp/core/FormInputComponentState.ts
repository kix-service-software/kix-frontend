/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from './AbstractComponentState';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormContext } from '../../../../model/configuration/FormContext';

export class FormInputComponentState<T> extends AbstractComponentState {

    public constructor(
        public fieldId: string = null,
        public field: FormFieldConfiguration = null,
        public formId: string = null,
        public defaultValue: FormFieldValue<T> = null,
        public invalid: boolean = false,
        public formContext: FormContext = null,
        public prepared: boolean = false
    ) {
        super();
    }

}
