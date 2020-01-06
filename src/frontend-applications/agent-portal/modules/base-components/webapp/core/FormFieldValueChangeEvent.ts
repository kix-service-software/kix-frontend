/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { UpdateFormEvent } from "./UpdateFormEvent";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { FormFieldValue } from "../../../../model/configuration/FormFieldValue";

export class FormFieldValueChangeEvent<T = any> extends UpdateFormEvent {

    public constructor(
        public formField: FormFieldConfiguration,
        public formFieldValue: FormFieldValue<T>
    ) {
        super();
    }

}
