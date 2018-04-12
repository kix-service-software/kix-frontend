import { FormTextInputComponentState } from './FormTextInputComponentState';

class FormTextInputComponent {

    private state: FormTextInputComponentState;

    public onCreate(input: any): void {
        this.state = new FormTextInputComponentState(input.field);
    }

}

module.exports = FormTextInputComponent;
