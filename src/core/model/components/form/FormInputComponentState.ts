/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldValue } from ".";
import { FormContext } from "./FormContext";
import { AbstractComponentState } from "../../../browser/components/AbstractComponentState";
import { FormFieldConfiguration } from "./configuration";

export class FormInputComponentState<T> extends AbstractComponentState {

    public constructor(
        public fieldId: string = null,
        public field: FormFieldConfiguration = null,
        public formId: string = null,
        public defaultValue: FormFieldValue<T> = null,
        public invalid: boolean = false,
        public formContext: FormContext = null
    ) {
        super();
    }

}
