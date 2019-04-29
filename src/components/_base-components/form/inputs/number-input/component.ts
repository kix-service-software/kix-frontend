import { ComponentState } from './ComponentState';
import { FormInputComponent, InputFieldTypes, FormFieldOptions, NumberInputOptions } from '../../../../../core/model';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);

        this.state.currentValue = typeof input.currentValue !== 'undefined' ?
            input.currentValue : this.state.currentValue;
        this.update();
    }

    private async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';
        this.state.placeholder = await TranslationService.translate(placeholderText);
        this.prepareOptions();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.setCurrentValue();
    }

    private async prepareOptions(): Promise<void> {
        if (this.state.field && this.state.field.options) {
            const maxOption = this.state.field.options.find(
                (o) => o.option === NumberInputOptions.MAX
            );
            if (maxOption) {
                this.state.max = maxOption.value;
            }
            const minOption = this.state.field.options.find(
                (o) => o.option === NumberInputOptions.MIN
            );
            if (minOption) {
                this.state.min = minOption.value;
                if (typeof this.state.currentValue === 'undefined' || this.state.currentValue === null) {
                    this.state.currentValue = this.state.min.toString();
                }
            }
            const stepOption = this.state.field.options.find(
                (o) => o.option === NumberInputOptions.STEP
            );
            if (stepOption) {
                this.state.step = stepOption.value;
            }
            const unitStringOption = this.state.field.options.find(
                (o) => o.option === NumberInputOptions.UNIT_STRING
            );
            if (unitStringOption) {
                const string = await TranslationService.translate(unitStringOption.value);
                this.state.unitstring = ` ${string}`;
            }
        }
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

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
