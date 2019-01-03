import { FormService, IdService } from "../../../browser";
import { FormInputComponentState } from ".";

export abstract class FormInputComponent<T, C extends FormInputComponentState<T>> {

    protected state: C;
    private inputComponentFormListenerId: string;

    public async onInput(input: FormInputComponentState<T>): Promise<void> {
        this.state.field = input.field;
        this.state.fieldId = input.fieldId;
        this.state.formId = input.formId;

        if (!this.state.fieldId) {
            this.state.fieldId = this.state.field ? this.state.field.property : null;
        }

        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        this.state.formContext = formInstance.getFormContext();

        if (!this.state.field) {
            this.state.field = await formInstance.getFormField(this.state.field.instanceId);
        }
    }

    public async onMount(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        this.inputComponentFormListenerId = IdService.generateDateBasedId('FormInputComponent');
        formInstance.registerListener({
            formListenerId: this.inputComponentFormListenerId,
            updateForm: () => {
                FormInputComponent.prototype.setInvalidState.call(this);
            },
            formValueChanged: () => { return; }
        });
        this.state.defaultValue = formInstance.getFormFieldValue<T>(this.state.field.instanceId);
        FormInputComponent.prototype.setInvalidState.call(this);
    }

    public async onDestroy(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.removeListener(this.inputComponentFormListenerId);
    }

    protected async provideValue(value: T): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.provideFormFieldValue<any>(this.state.field.instanceId, value);
    }

    protected async setInvalidState(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue(this.state.field.instanceId);
            if (value) {
                this.state.invalid = !value.valid;
            }
        }
    }
}
