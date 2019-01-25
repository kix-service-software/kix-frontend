import { Form, FormField, Group } from "../../model";
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
                f.maxLength, f.regEx, f.regExErrorMessage, f.empty, f.asStructure, f.readonly, f.placeholder
            ))
            : [];
    }

}
