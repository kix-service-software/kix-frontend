import { ComponentState } from "./ComponentState";
import { FormInputComponent } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        this.setCurrentValue();
    }

    public setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue<string>(this.state.field.property);
            if (value) {
                this.state.currentValue = value.value;
            }
        }
    }

    private valueChanged(value: any): void {
        this.state.currentValue = value || '';
        super.provideValue(this.state.currentValue);
    }
}

module.exports = Component;
