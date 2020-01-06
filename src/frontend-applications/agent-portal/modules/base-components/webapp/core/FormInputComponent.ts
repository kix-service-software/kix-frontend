/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState } from "./FormInputComponentState";
import { FormService } from "./FormService";
import { IdService } from "../../../../model/IdService";

export abstract class FormInputComponent<T, C extends FormInputComponentState<T>> {

    protected state: C;
    private inputComponentFormListenerId: string;

    public onInput(input: FormInputComponentState<T>): any {
        this.state.field = input.field;
        this.state.fieldId = input.fieldId;
        this.state.formId = input.formId;

        if (!this.state.fieldId) {
            this.state.fieldId = this.state.field ? this.state.field.property : null;
        }

        FormInputComponent.prototype.doUpdate.call(this);

        return input;
    }

    private async doUpdate(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        this.state.formContext = formInstance.getFormContext();

        if (!this.state.field) {
            this.state.field = await formInstance.getFormField(this.state.field.instanceId);
        }
    }

    public async onMount(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        this.inputComponentFormListenerId = IdService.generateDateBasedId('FormInputComponent');
        await FormService.getInstance().registerFormInstanceListener(this.state.formId, {
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
        FormService.getInstance().removeFormInstanceListener(this.state.formId, this.inputComponentFormListenerId);
    }

    protected async provideValue(value: T, silent?: boolean): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.provideFormFieldValue<any>(this.state.field.instanceId, value, silent);
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

    public async focusLost(event?: any): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance && formInstance.getForm().validation) {
            await formInstance.validateField(this.state.field);
            FormInputComponent.prototype.setInvalidState.call(this);
        }
    }
}
