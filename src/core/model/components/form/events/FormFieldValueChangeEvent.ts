/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldValue } from "./FormFieldValue";
import { IFormEvent } from ".";
import { FormField } from "..";
import { UpdateFormEvent } from './UpdateFormEvent';

export class FormFieldValueChangeEvent<T = any> extends UpdateFormEvent {

    public constructor(
        public formField: FormField,
        public formFieldValue: FormFieldValue<T>
    ) {
        super();
    }

}
