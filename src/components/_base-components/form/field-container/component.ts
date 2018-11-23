import { FormField } from "@kix/core/dist/model";
import { ComponentState } from './ComponentState';
import { FormService } from "@kix/core/dist/browser";

class FieldContainerComponent {

    private state: ComponentState;
    private formId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.level = typeof input.level !== 'undefined' ? input.level : 0;
        this.state.fields = input.fields;
        this.formId = input.formId;
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
            formInstance.removeFormField(field, this.state.fields);
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
            formInstance.cloneFormField(field, this.state.fields);
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
