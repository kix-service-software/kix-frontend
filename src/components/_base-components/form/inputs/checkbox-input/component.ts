import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../core/model';

class Component extends FormInputComponent<any, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        await this.setCurrentValue();
    }

    public async setCurrentValue(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.checked = this.state.defaultValue.value;
            super.provideValue(this.state.checked);
        }
    }

    public checkboxClicked(): void {
        this.state.checked = !this.state.checked;
        super.provideValue(this.state.checked);
    }
}

module.exports = Component;
