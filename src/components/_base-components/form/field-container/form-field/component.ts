import { ComponentsService } from "@kix/core/dist/browser/components";
import { ComponentState } from "./ComponentState";
import { FormService, IdService } from "@kix/core/dist/browser";
import { FormField } from "@kix/core/dist/model";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.field = input.field;
        this.state.objectType = input.objectType;
        this.state.formId = input.formId;
        this.state.level = typeof input.level !== 'undefined' ? input.level : 0;
        if (this.state.level > 14) {
            this.state.level = 14;
        }
    }

    public onMount(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.registerListener({
            formListenerId: IdService.generateDateBasedId('form-field'),
            formValueChanged: () => { return; },
            updateForm: () => {
                if (this.hasChildren()) {
                    this.state.minimized = this.state.minimized && !this.hasInvalidChildren();
                }
            }
        });
    }

    private hasInvalidChildren(field: FormField = this.state.field): boolean {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        let hasInavlidChildren = false;
        for (const child of field.children) {
            const value = formInstance.getFormFieldValue(child.instanceId);
            if (!value.valid) {
                return true;
            }

            hasInavlidChildren = this.hasInvalidChildren(child);
        }

        return hasInavlidChildren;
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
        return this.hasChildren() ? "0" : "1.75rem";
    }

}

module.exports = Component;
