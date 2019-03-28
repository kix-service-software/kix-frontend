import { ComponentState } from './ComponentState';
import { FormInputComponent, InputFieldTypes, FormFieldOptions } from '../../../../../core/model';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);

        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.currentValue = typeof input.currentValue !== 'undefined' ?
            input.currentValue : this.state.currentValue;
        if (this.state.field && this.state.field.options) {
            const inputTypeOption = this.state.field.options.find(
                (o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE
            );
            if (inputTypeOption) {
                this.state.inputType = inputTypeOption.value.toString() || InputFieldTypes.TEXT;
            }
        }
        this.update();
    }

    private async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';
        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.setCurrentValue();
    }

    public setCurrentValue(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentValue = this.state.defaultValue.value;
            (this as any).emit('valueChanged', this.state.currentValue);
            super.provideValue(this.state.currentValue);
        }
    }

    public valueChanged(event: any): void {
        if (event) {
            this.state.currentValue = event.target && event.target.value !== '' ? event.target.value : null;
            (this as any).emit('valueChanged', this.state.currentValue);
            super.provideValue(this.state.currentValue);
        }
    }

    public getAutoCompleteOption(): string {
        if (this.state.inputType === InputFieldTypes.PASSWORD) {
            return 'new-password';
        }

        return 'nope';
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
