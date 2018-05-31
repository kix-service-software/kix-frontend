import { ComponentState } from './ComponentState';
import { FormService } from '@kix/core/dist/browser/form';
import { FormFieldValue, FormField, FormInputComponent } from '@kix/core/dist/model';

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(input: any): void {
        this.state = new ComponentState(input.field);
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
        this.state.placeholder = typeof input.placeholder !== 'undefined' ? input.placeholder : this.state.field.label;
        this.state.currentValue = typeof input.currentValue !== 'undefined' ? input.currentValue : '';
        // this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : this.state.invalid;
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        this.setCurrentValue();
    }

    public setCurrentValue(): void {
        return;
    }

    private valueChanged(event: any): void {
        if (event) {
            this.state.currentValue = event.target ? event.target.value : '';
            super.provideValue(this.state.currentValue);
            (this as any).emit('valueChanged', this.state.currentValue);
        }
    }

    private keyDown(event: any): void {
        if (event.key === 'Enter') {
            this.valueChanged(event);
        }
    }

    private focusLost(event: any): void {
        this.valueChanged(event);
    }
}

module.exports = Component;
