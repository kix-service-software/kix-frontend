import { FormTextInputComponentState } from './FormTextInputComponentState';
import { FormService } from '@kix/core/dist/browser/form';

class FormTextInputComponent {

    private state: FormTextInputComponentState;

    public onCreate(input: any): void {
        this.state = new FormTextInputComponentState(input.field);
    }

    public onInput(input: any): void {
        this.state.currentValue = input.currentValue;
        this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : false;
        this.state.formId = input.formId;
    }

    private valueChanged(event: any): void {
        this.state.currentValue = event.target.value;
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.provideFormFieldValue(this.state.formField.property, this.state.currentValue);
        }
        (this as any).emit('valueChanged', this.state.currentValue);
    }

    private keyDown(event: any): void {
        if (event.key === 'Enter') {
            this.valueChanged(event);
        }
    }

    private focusLost(): void {
        (this as any).emit('valueChanged', this.state.currentValue);
    }

}

module.exports = FormTextInputComponent;
