/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../../../../../modules/base-components/webapp/core/InputFieldTypes';
import { ContextService } from '../../core/ContextService';

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);

        this.state.currentValue = typeof input.currentValue !== 'undefined' ?
            input.currentValue : this.state.currentValue;
        if (this.state.field && this.state.field?.options) {
            const inputTypeOption = this.state.field?.options.find(
                (o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE
            );
            if (inputTypeOption) {
                this.state.inputType = inputTypeOption.value.toString() || InputFieldTypes.TEXT;
            }
            if (this.state.inputType === InputFieldTypes.PASSWORD) {
                this.state.isPasswordInit = true;
            }
        }
        this.update();
    }

    private async update(): Promise<void> {
        const placeholderText = this.state.field?.placeholder
            ? this.state.field?.placeholder
            : this.state.field?.required ? this.state.field?.label : '';
        this.state.placeholder = await TranslationService.translate(placeholderText);
        (this as any).setStateDirty('field');
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<string>(this.state.field?.instanceId);
        if (value) {
            this.state.currentValue = value.value;
        }
    }

    public valueChanged(event: any): void {
        if (event) {
            this.state.currentValue = event.target && event.target.value !== '' ? event.target.value : null;
            (this as any).emit('valueChanged', this.state.currentValue);
            super.provideValue(this.state.currentValue);
        }
    }

    public getAutoCompleteOption(): string {
        if (this.state.inputType === InputFieldTypes.PASSWORD) {
            return 'new-password';
        }

        return 'off';
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    public togglePasswordVisible(): void {
        if (this.state.isPasswordInit) {
            this.state.isPasswordVisible = !this.state.isPasswordVisible;
        }
    }

    public getInputType(isPasswordVisible: boolean): string {
        if (isPasswordVisible) return InputFieldTypes.TEXT;
        return this.state.inputType;
    }

}

module.exports = Component;
