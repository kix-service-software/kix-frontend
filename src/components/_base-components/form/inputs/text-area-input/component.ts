import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../core/model';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
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

    private valueChanged(event: any): void {
        if (event) {
            this.state.currentValue = event.target && event.target.value !== '' ? event.target.value : null;
            (this as any).emit('valueChanged', this.state.currentValue);
            super.provideValue(this.state.currentValue);
        }
    }

    public keyDown(event: any): void {
        setTimeout(() => {
            this.valueChanged(event);
        }, 100);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
