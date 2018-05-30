import { FormTextInputComponentState } from './FormTextInputComponentState';
import { FormService } from '@kix/core/dist/browser/form';
import { FormFieldValue, FormField } from '@kix/core/dist/model';

class FormTextInputComponent {

    private state: FormTextInputComponentState;

    public onCreate(input: any): void {
        this.state = new FormTextInputComponentState(input.field);
    }

    public onInput(input: any): void {
        this.state.currentValue = input.currentValue;
        this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : false;
        this.state.formId = input.formId;
        this.state.placeholder = input.placeholder ? input.placeholder : this.state.formField.label;

        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.registerListener({
                formValueChanged: (formField: FormField, value: FormFieldValue<any>, oldValue: any) => {
                    if (formField.property === this.state.formField.property) {
                        this.state.invalid = !value.valid;
                    }
                },
                updateForm: () => { return; }
            });
        }
    }

    private valueChanged(event: any): void {
        if (event) {
            const value = event.target ? event.target.value : '';
            this.provideValue(value);
        }
    }

    private keyDown(event: any): void {
        if (event.key === 'Enter') {
            this.valueChanged(event);
        }
    }

    private focusLost(event: any): void {
        this.valueChanged(event);
    }

    private provideValue(value: string = ''): void {
        this.state.currentValue = value;
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.provideFormFieldValue(this.state.formField.property, this.state.currentValue);
        }
        (this as any).emit('valueChanged', this.state.currentValue);
    }

}

module.exports = FormTextInputComponent;
