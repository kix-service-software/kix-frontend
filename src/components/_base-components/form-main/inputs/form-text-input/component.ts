import { FormTextInputComponentState } from './FormTextInputComponentState';
import { FormService } from '@kix/core/dist/browser/form';

class FormTextInputComponent {

    private state: FormTextInputComponentState;

    public onCreate(input: any): void {
        this.state = new FormTextInputComponentState(input.field);
    }

    private valueChanged(event: any): void {
        (this as any).emit('valueChanged', event.target.value);
    }

}

module.exports = FormTextInputComponent;
