/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from "../../../../base-components/webapp/core/FormInputComponent";
import { ComponentState } from './ComponentState';
import { FormService } from "../../../../base-components/webapp/core/FormService";
import { ContextService } from "../../../../base-components/webapp/core/ContextService";
import { AdditionalContextInformation } from "../../../../base-components/webapp/core/AdditionalContextInformation";
import { IdService } from "../../../../../model/IdService";
import { FormFieldValue } from "../../../../../model/configuration/FormFieldValue";
import { FormFieldConfiguration } from "../../../../../model/configuration/FormFieldConfiguration";
import { DynamicFieldProperty } from "../../../model/DynamicFieldProperty";
import { DynamicFieldService } from "../../core";
import { FormContext } from "../../../../../model/configuration/FormContext";

declare var JSONEditor: any;

class Component extends FormInputComponent<JSON, ComponentState> {

    private schema: JSON = null;
    private type: string;

    private editor: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            const formId = context.getAdditionalInformation(AdditionalContextInformation.FORM_ID);
            if (formId) {
                const formInstance = await FormService.getInstance().getFormInstance(formId);
                if (formInstance) {
                    formInstance.registerListener({
                        formListenerId: IdService.generateDateBasedId('config-input'),
                        formValueChanged: this.formValueChanged.bind(this),
                        updateForm: () => { return; }
                    });

                    await this.setValue();
                }
            }
        }
    }

    private async formValueChanged(
        formField: FormFieldConfiguration, value: FormFieldValue<any>, oldValue: any
    ): Promise<void> {
        if (formField.property === DynamicFieldProperty.FIELD_TYPE) {
            if (value && value.value) {
                if (this.state.formContext === FormContext.NEW) {
                    setTimeout(() => this.createEditor(value.value, null), 50);
                }
            } else {
                await this.onDestroy();
                this.state.prepared = false;
            }
        }
    }

    private async setValue(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const defaultValue = formInstance.getFormFieldValue<number>(this.state.field.instanceId);

        const typeValue = await formInstance.getFormFieldValueByProperty<string>(DynamicFieldProperty.FIELD_TYPE);
        if (typeValue && typeValue.value && typeValue.value) {
            await this.createEditor(typeValue.value, defaultValue ? defaultValue.value : null);
        }
    }

    private async createEditor(type: string, value?: any): Promise<void> {
        await this.onDestroy();
        this.schema = DynamicFieldService.getInstance().getConfigSchema(type);
        if (this.schema) {
            this.state.prepared = true;

            setTimeout(() => {
                const element = document.getElementById(this.state.editorId);
                if (element) {
                    this.editor = new JSONEditor(element, {
                        schema: this.schema,
                        disable_edit_json: true,
                        disable_collapse: true,
                        disable_properties: true,
                        array_controls_top: true,
                        disable_array_delete_last_row: true,
                        disable_array_delete_all_rows: true,
                        disable_array_reorder: true
                    });

                    if (value) {
                        this.editor.setValue(value);
                    }

                    this.editor.on('change', this.valueChanged.bind(this));
                }
            }, 100);
        }
    }

    private valueChanged(): void {
        if (this.editor) {
            const config = this.editor.getValue();
            super.provideValue(config);
        }
    }

    public async onDestroy(): Promise<void> {
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }

}

module.exports = Component;
