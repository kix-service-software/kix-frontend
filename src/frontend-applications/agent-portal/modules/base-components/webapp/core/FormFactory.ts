/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from "../../../../model/configuration/FormConfiguration";
import { FormGroupConfiguration } from "../../../../model/configuration/FormGroupConfiguration";
import { FormPageConfiguration } from "../../../../model/configuration/FormPageConfiguration";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { IdService } from "../../../../model/IdService";

export class FormFactory {

    public static initForm(form: FormConfiguration) {
        if (form.pages) {
            form.pages = form.pages.map((p) => {
                let groups;
                if (p.groups) {
                    groups = p.groups.map(
                        (g) => new FormGroupConfiguration(
                            g.id, g.name, [], g.separatorString, this.initFormFields(g.formFields), g.draggableFields
                        )
                    );
                }
                return new FormPageConfiguration(
                    p.id, p.name, [], p.singleFormGroupOpen, p.showSingleGroup, groups
                );
            });
        }
    }

    private static initFormFields(fields: FormFieldConfiguration[]): FormFieldConfiguration[] {
        if (fields) {
            fields = fields.map((f) => {
                const field = new FormFieldConfiguration(
                    f.id,
                    f.label, f.property, f.inputComponent, f.required, f.hint, f.options, f.defaultValue,
                    f.fieldConfigurationIds, FormFactory.initFormFields(f.children), f.parentInstanceId, f.countDefault,
                    f.countMax, f.countMin, f.maxLength, f.regEx, f.regExErrorMessage, f.empty, f.asStructure,
                    f.readonly, f.placeholder, f.existingFieldId, f.showLabel, f.name, f.draggableFields
                );
                field.instanceId = IdService.generateDateBasedId();
                return field;
            });
        }
        return fields ? fields : [];
    }

}
