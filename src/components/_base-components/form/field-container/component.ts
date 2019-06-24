import { FormField } from '../../../../core/model';
import { ComponentState } from './ComponentState';
import { FormService, IdService, ServiceRegistry, ServiceType } from '../../../../core/browser';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { KIXObjectFormService } from '../../../../core/browser/kix/KIXObjectFormService';

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

    private async initFields(fields: FormField[]): Promise<void> {
        if (this.formId) {
            const formInstance = await FormService.getInstance().getFormInstance(this.formId);
            let availableFields: FormField[] = fields;

            const formService = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                formInstance.getObjectType(), ServiceType.FORM
            );
            if (formService) {
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

    public canRemove(field: FormField): boolean {
        const propertyFields = this.state.fields.filter((ff) => ff.property === field.property);
        if (propertyFields.length === 1 && field.empty) {
            return false;
        }
        return field.countMin !== null && field.countMin < propertyFields.length;
    }

    public async removeField(field: FormField): Promise<void> {
        const propertyFields = this.state.fields.filter((ff) => ff.property === field.property);
        if (propertyFields.length === 1) {
            this.setFieldsEmpty(field, true);
        } else {
            const formInstance = await FormService.getInstance().getFormInstance(this.formId);
            formInstance.removeFormField(field);
        }
        (this as any).setStateDirty('fields');
    }

    public canAdd(field: FormField): boolean {
        const propertyFields = this.state.fields.filter((ff) => ff.property === field.property);
        const index = propertyFields.findIndex((f) => f.instanceId === field.instanceId);
        if (propertyFields.length === 1 && field.empty) {
            return true;
        }
        return field.countMax !== null
            && field.countMax > propertyFields.length
            && index !== -1 && index === propertyFields.length - 1;
    }

    public async addField(field: FormField): Promise<void> {
        if (field.empty) {
            this.setFieldsEmpty(field, false);
        } else {
            const formInstance = await FormService.getInstance().getFormInstance(this.formId);
            await formInstance.addFormField(field);
        }
        (this as any).setStateDirty('fields');
    }

    private setFieldsEmpty(field: FormField, empty: boolean): void {
        field.empty = empty;
        if (field.children) {
            field.children.forEach((f) => this.setFieldsEmpty(f, empty));
        }
    }

}

module.exports = FieldContainerComponent;
