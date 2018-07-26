import { ComponentState } from './ComponentState';
import { FormInputComponent, InputFieldTypes, FormFieldOptions } from '@kix/core/dist/model';

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.placeholder = typeof input.placeholder !== 'undefined' ? input.placeholder : this.state.field.label;
        this.state.currentValue = typeof input.currentValue !== 'undefined' ?
            input.currentValue : this.state.currentValue;
        this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : this.state.invalid;
        if (this.state.field && this.state.field.options) {
            const inputTypeOption = this.state.field.options.find(
                (o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE
            );
            if (inputTypeOption) {
                this.state.inputType = inputTypeOption.value.toString() || InputFieldTypes.TEXT;
            }
        }
    }

    public onMount(): void {
        super.onMount();
    }

    private valueChanged(event: any): void {
        console.log('valueChanged');
        if (event) {
            this.state.currentValue = event.target ? event.target.value : '';
            console.log('valueChanged: ' + this.state.currentValue);
            (this as any).emit('valueChanged', this.state.currentValue);
            super.provideValue(this.state.currentValue);
        }
    }

    public keyDown(event: any): void {
        console.log('keyDown');
        setTimeout(() => {
            console.log('keyDown-timeout');
            this.valueChanged(event);
        }, 100);
    }

    public getAutoCompleteOption(): string {
        if (this.state.inputType === InputFieldTypes.PASSWORD) {
            return "new-password";
        }

        return "nope";
    }

}

module.exports = Component;
