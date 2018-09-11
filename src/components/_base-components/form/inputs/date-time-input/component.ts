import { ComponentState } from './ComponentState';
import { FormInputComponent, InputFieldTypes, FormFieldOptions } from '@kix/core/dist/model';

class Component extends FormInputComponent<string | Date, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.placeholder = typeof input.placeholder !== 'undefined' ? input.placeholder : this.state.field.label;
        this.state.currentValue = typeof input.currentValue !== 'undefined' ?
            input.currentValue : this.state.currentValue;
        if (this.state.field && this.state.field.options) {
            const option = this.state.field.options.find(
                (o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE
            );
            if (option) {
                this.state.inputType = option.value.toString();
            }
        }
    }

    public onMount(): void {
        super.onMount();
        this.state.dateValue = null;
        this.state.timeValue = null;
        this.setCurrentValue();
    }

    public setCurrentValue(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentValue = new Date(this.state.defaultValue.value);
            // TODO: set correct default value
            this.setValue();
        }
    }

    public dateChanged(event: any): void {
        if (event) {
            this.state.dateValue = event.target && event.target.value !== '' ? event.target.value : null;
            this.setValue();
        }
    }

    public timeChanged(event: any): void {
        if (event) {
            this.state.timeValue = event.target && event.target.value !== '' ? event.target.value : null;
            this.setValue();
        }
    }

    private setValue(): void {
        const time = (this.state.timeValue ? this.state.timeValue : '');
        this.state.currentValue = new Date(this.state.dateValue + time);
        (this as any).emit('valueChanged', this.state.currentValue);
        super.provideValue(this.state.currentValue);
    }

}

module.exports = Component;
