/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormService, IdService, ServiceRegistry, ServiceType } from '../../../../core/browser';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { KIXObjectFormService } from '../../../../core/browser/kix/KIXObjectFormService';
import { FormFieldConfiguration } from '../../../../core/model/components/form/configuration';
import { FormInstance } from '../../../../core/model';

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
        const propertyFields = this.state.fields.filter((ff) => ff.property === field.property);
        if (propertyFields.length === 1 && field.empty) {
            return false;
        }
        return field.countMin !== null && field.countMin < propertyFields.length;
    }

    public async removeField(field: FormFieldConfiguration): Promise<void> {
        const propertyFields = this.state.fields.filter((ff) => ff.property === field.property);
        if (propertyFields.length === 1) {
            this.setFieldsEmpty(field, true);
        } else {
            const formInstance = await FormService.getInstance().getFormInstance(this.formId);
            formInstance.removeFormField(field);
        }
        (this as any).setStateDirty('fields');
    }

    public canAdd(field: FormFieldConfiguration): boolean {
        const propertyFields = this.state.fields.filter((ff) => ff.property === field.property);
        const index = propertyFields.findIndex((f) => f.instanceId === field.instanceId);
        if (propertyFields.length === 1 && field.empty) {
            return true;
        }
        return field.countMax !== null
            && field.countMax > propertyFields.length
            && index !== -1 && index === propertyFields.length - 1;
    }

    public async addField(field: FormFieldConfiguration): Promise<void> {
        if (field.empty) {
            this.setFieldsEmpty(field, false);
        } else {
            const formInstance = await FormService.getInstance().getFormInstance(this.formId);
            formInstance.addFormField(field);
        }
        (this as any).setStateDirty('fields');
    }

    private setFieldsEmpty(field: FormFieldConfiguration, empty: boolean): void {
        field.empty = empty;
        if (field.children) {
            field.children.forEach((f) => this.setFieldsEmpty(f, empty));
        }
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
