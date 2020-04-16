/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { IdService } from '../../../../../model/IdService';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { KIXObjectFormService } from '../../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { ServiceType } from '../../../../../modules/base-components/webapp/core/ServiceType';
import { FormInstance } from '../../../../../modules/base-components/webapp/core/FormInstance';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { DynamicFormFieldOption } from '../../../../dynamic-fields/webapp/core';

class FieldContainerComponent {

    private state: ComponentState;
    private formId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.level = typeof input.level !== 'undefined' ? input.level : 0;
        this.formId = input.formId;
        this.initFields(input.fields);
    }

    public async onMount(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.formId);
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Add", "Translatable#Delete"
        ]);
        formInstance.registerListener({
            updateForm: () => (this as any).setStateDirty('fields'),
            formValueChanged: () => { return; },
            formListenerId: IdService.generateDateBasedId('form-field-container')
        });
    }

    private async initFields(fields: FormFieldConfiguration[]): Promise<void> {
        if (this.formId) {
            const formInstance = await FormService.getInstance().getFormInstance(this.formId);
            let availableFields: FormFieldConfiguration[] = fields;

            const formService = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                formInstance.getObjectType(), ServiceType.FORM
            );
            if (formService && fields) {
                const fieldsWithPermission = [];
                for (const field of fields) {
                    if (await formService.hasPermissions(field)) {
                        fieldsWithPermission.push(field);
                    }
                }
                availableFields = fieldsWithPermission;
            }
            this.state.fields = availableFields;
        }
    }

    public canRemove(field: FormFieldConfiguration): boolean {
        let propertyFields = this.state.fields.filter((ff) => ff.property === field.property);

        if (field.property === KIXObjectProperty.DYNAMIC_FIELDS) {
            propertyFields = this.filterDynamicFields(field, propertyFields);
        }

        if (propertyFields.length === 1 && field.empty) {
            return false;
        }
        return field.countMin !== null && field.countMin < propertyFields.length;
    }

    public async removeField(field: FormFieldConfiguration): Promise<void> {
        let propertyFields = this.state.fields.filter((ff) => ff.property === field.property);

        if (field.property === KIXObjectProperty.DYNAMIC_FIELDS) {
            propertyFields = this.filterDynamicFields(field, propertyFields);
        }

        const formInstance = await FormService.getInstance().getFormInstance(this.formId);
        if (propertyFields.length === 1) {
            formInstance.setFieldEmptyState(field, true);
        } else {
            formInstance.removeFormField(field);
        }
        (this as any).setStateDirty('fields');
    }

    public canAdd(field: FormFieldConfiguration): boolean {
        let propertyFields = this.state.fields.filter((ff) => ff.property === field.property);

        if (field.property === KIXObjectProperty.DYNAMIC_FIELDS) {
            propertyFields = this.filterDynamicFields(field, propertyFields);
        }

        if (propertyFields.length === 1 && field.empty) {
            return true;
        }

        const index = propertyFields.findIndex((f) => f.instanceId === field.instanceId);

        return field.countMax !== null
            && field.countMax > propertyFields.length
            && index !== -1 && index === propertyFields.length - 1;
    }

    private filterDynamicFields(
        field: FormFieldConfiguration, fields: FormFieldConfiguration[]
    ): FormFieldConfiguration[] {
        const nameOption = field.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
        if (nameOption) {
            const dfName = nameOption.value;
            return fields.filter((pf) => {
                const pfNameOption = pf.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
                if (pfNameOption) {
                    return pfNameOption.value === dfName;
                }
                return false;
            });
        }

        return [];
    }

    public async addField(field: FormFieldConfiguration): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.formId);
        if (field.empty) {
            formInstance.setFieldEmptyState(field, false);
        } else {
            formInstance.addFormField(field);
        }
        (this as any).setStateDirty('fields');
    }

    public async dragStart(fieldInstanceId: string) {
        if (fieldInstanceId) {
            this.state.dragStartIndex = this.state.fields.findIndex((f) => f.instanceId === fieldInstanceId);
            this.state.dragStartInstanceId = fieldInstanceId;
        }
    }

    public async dragEnd() {
        this.state.dragStartIndex = null;
        this.state.dragStartInstanceId = null;
    }

    public allowDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        return false;
    }

    public handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.add('drag-over');
    }

    public handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.remove('drag-over');
    }

    public async handleDrop(index: number, event) {
        event.stopPropagation();
        event.preventDefault();
        const formInstance = await FormService.getInstance().getFormInstance<FormInstance>(this.formId);
        if (formInstance && this.state.dragStartInstanceId) {
            formInstance.changeFieldOrder(this.state.dragStartInstanceId, index);
        }
        this.state.dragStartIndex = null;
        this.state.dragStartInstanceId = null;
        return false;
    }

}

module.exports = FieldContainerComponent;
