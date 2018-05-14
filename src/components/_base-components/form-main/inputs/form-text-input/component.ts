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
    }

    private valueChanged(event: any): void {
        this.state.currentValue = event.target.value;
        (this as any).emit('valueChanged', this.state.currentValue);
    }

    private focusLost(): void {
        (this as any).emit('valueChanged', this.state.currentValue);
    }

}

module.exports = FormTextInputComponent;
