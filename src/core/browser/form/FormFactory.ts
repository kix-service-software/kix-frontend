/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Form, FormField } from "../../model";
import { FormGroup } from "../../model/components/form/FormGroup";

export class FormFactory {

    public static initForm(form: Form) {
        form.groups = form.groups.map(
            (g) => new FormGroup(g.name, this.initFormFields(g.formFields), g.separatorString)
        );
    }

    private static initFormFields(fields: FormField[]): FormField[] {
        return fields
            ? fields.map((f) => new FormField(
                f.label, f.property, f.inputComponent, f.required, f.hint, f.options, f.defaultValue,
                FormFactory.initFormFields(f.children), f.parentInstanceId, f.countDefault, f.countMax, f.countMin,
                f.maxLength, f.regEx, f.regExErrorMessage, f.empty, f.asStructure, f.readonly, f.placeholder,
                f.existingFieldId, f.showLabel
            ))
            : [];
    }

}
