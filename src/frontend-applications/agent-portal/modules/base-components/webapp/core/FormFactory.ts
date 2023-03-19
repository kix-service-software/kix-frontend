/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../../../model/configuration/FormPageConfiguration';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { IdService } from '../../../../model/IdService';

export class FormFactory {

    public static initForm(form: FormConfiguration): void {
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
            fields = fields.filter((f) => f !== null && typeof f !== 'undefined').map((f) => this.cloneField(f));
        }
        return fields ? fields : [];
    }

    public static cloneField(field: FormFieldConfiguration, prefixForNewInstanceId?: string): FormFieldConfiguration {
        const clonedField = new FormFieldConfiguration(
            field.id,
            field.label,
            field.property,
            field.inputComponent,
            field.required,
            field.hint,
            Array.isArray(field.options) ? [...field.options] : [],
            field.defaultValue,
            field.fieldConfigurationIds,
            Array.isArray(field.children) ? FormFactory.initFormFields([...field.children]) : [],
            field.parentInstanceId,
            field.countDefault,
            field.countMax,
            field.countMin,
            field.maxLength,
            field.regEx,
            field.regExErrorMessage,
            field.empty,
            field.asStructure,
            field.readonly,
            field.placeholder,
            field.existingFieldId,
            field.showLabel,
            field.name,
            field.draggableFields,
            field.defaultHint,
            field.type,
            field.visible
        );
        clonedField.instanceId = field.instanceId || IdService.generateDateBasedId(prefixForNewInstanceId);
        clonedField.parent = field.parent;
        return clonedField;
    }

}
