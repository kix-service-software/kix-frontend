import { ComponentsService } from "../../../../../core/browser/components";
import { ComponentState } from "./ComponentState";
import { FormService, IdService } from "../../../../../core/browser";
import { FormField } from "../../../../../core/model";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
        this.state.level = typeof input.level !== 'undefined' ? input.level : 0;
        if (this.state.level > 14) {
            this.state.level = 14;
        }
    }

    public async onMount(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.registerListener({
            formListenerId: IdService.generateDateBasedId('form-field-' + this.state.field.instanceId),
            formValueChanged: () => { return; },
            updateForm: async () => {
                if (this.hasChildren()) {
                    this.state.minimized = this.state.minimized && !(await this.hasInvalidChildren());
                }
            }
        });
    }

    private async hasInvalidChildren(field: FormField = this.state.field): Promise<boolean> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        let hasInvalidChildren = false;
        for (const child of field.children) {
            const value = formInstance.getFormFieldValue(child.instanceId);
            if (!value.valid) {
                return true;
            }

            hasInvalidChildren = await this.hasInvalidChildren(child);
        }

        return hasInvalidChildren;
    }

    public getInputComponent(): any {
        const componentId = this.state.field.inputComponent ? this.state.field.inputComponent : 'form-default-input';
        return ComponentsService.getInstance().getComponentTemplate(componentId);
    }

    public minimize(): void {
        this.state.minimized = !this.state.minimized;
    }

    public hasChildren(): boolean {
        return this.state.field.children && this.state.field.children.length > 0;
    }

    public getPaddingLeft(): string {
        return (this.state.level * 2) + "rem";
    }

    public getPaddingRight(): string {
        if (this.state.level > 1) {
            return "1.75rem";
        } else {
            return "0";
        }
    }

}

module.exports = Component;
