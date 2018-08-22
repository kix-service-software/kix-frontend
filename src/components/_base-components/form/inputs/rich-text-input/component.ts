import { ComponentState } from "./ComponentState";
import { FormInputComponent } from "@kix/core/dist/model";

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        this.setCurrentValue();
    }

    public setCurrentValue(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentValue = this.state.defaultValue.value;
            super.provideValue(this.state.currentValue);
        }
    }

    public valueChanged(value: string): void {
        this.state.currentValue = value;
        if (this.state.currentValue === '') {
            this.state.currentValue = null;
        }
        super.provideValue(this.state.currentValue);
    }

}

module.exports = Component;
