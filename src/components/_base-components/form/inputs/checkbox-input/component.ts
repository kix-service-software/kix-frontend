import { ComponentState } from "./ComponentState";
import { FormInputComponent } from "../../../../../core/model";

class Component extends FormInputComponent<any, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        await this.setCurrentValue();
    }

    public async setCurrentValue(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.checked = this.state.defaultValue.value;
        }
    }

    public checkboxClicked(): void {
        this.state.checked = !this.state.checked;
        super.provideValue(this.state.checked);
    }
}

module.exports = Component;
