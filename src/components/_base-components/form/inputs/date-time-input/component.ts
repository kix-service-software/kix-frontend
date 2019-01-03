import { ComponentState } from './ComponentState';
import { FormInputComponent, FormFieldOptions, DateTimeUtil } from '../../../../../core/model';

class Component extends FormInputComponent<string | Date, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
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

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.dateValue = null;
        this.state.timeValue = null;
        this.setCurrentValue();
    }

    public setCurrentValue(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentValue = new Date(this.state.defaultValue.value);
            this.state.dateValue = DateTimeUtil.getKIXDateString(this.state.currentValue);
            this.state.timeValue = DateTimeUtil.getKIXTimeString(this.state.currentValue, true);
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
        this.state.currentValue = this.state.dateValue ? new Date(
            this.state.dateValue + (this.state.timeValue ? ` ${this.state.timeValue}` : '')
        ) : null;
        (this as any).emit('valueChanged', this.state.currentValue);
        super.provideValue(this.state.currentValue);
    }
}

module.exports = Component;
