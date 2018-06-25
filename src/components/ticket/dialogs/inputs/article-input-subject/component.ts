import { ComponentState } from "./ComponentState";
import { FormInputComponent } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
    }

    public valueChanged(value: any): void {
        this.state.currentValue = value && value !== '' ? value : null;
        super.provideValue(this.state.currentValue);
    }
}

module.exports = Component;
