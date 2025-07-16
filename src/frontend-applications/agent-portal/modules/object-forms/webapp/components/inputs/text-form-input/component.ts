/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldOptions } from '../../../../../../model/configuration/FormFieldOptions';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { InputFieldTypes } from '../../../../../base-components/webapp/core/InputFieldTypes';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: ObjectFormValue;
    private changeTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.formValue?.instanceId !== input.formValue?.instanceId) {
            this.formValue?.removePropertyBinding(this.bindingIds);
            this.formValue = input.formValue;
            this.state.isPassword = this.formValue.formField?.options.some(
                (option) => option.option === FormFieldOptions.INPUT_FIELD_TYPE &&
                    option.value === InputFieldTypes.PASSWORD
            );
            this.update();
        }
    }

    private async update(): Promise<void> {
        this.bindingIds = [];

        this.bindingIds.push(
            this.formValue?.addPropertyBinding(
                FormValueProperty.VALUE, async (formValue: ObjectFormValue) => {
                    this.state.value = formValue.value;
                }
            )
        );

        this.bindingIds.push(
            this.formValue.addPropertyBinding(FormValueProperty.READ_ONLY, (formValue: ObjectFormValue) => {
                this.state.readonly = formValue.readonly;
            })
        );

        this.state.value = this.formValue?.value;
        this.state.readonly = this.formValue?.readonly;
        this.state.inputType = this.formValue.isPassword ? 'password' : 'text';
        this.state.autocompleteProperty = this.formValue.isPassword ? 'new-password' : 'off';
    }

    public async onMount(): Promise<void> {
        return;
    }

    public onDestroy(): void {
        this.formValue?.removePropertyBinding(this.bindingIds);
    }

    public keyDown(event: any): void {
        if (event.keyCode === 13) {
            this.state.value = event.target.value;
            this.formValue.setFormValue(this.state.value);
        }
    }

    public valueChanged(event: any): void {
        this.formValue.dirty = true;
        if (this.changeTimeout) {
            window.clearTimeout(this.changeTimeout);
        }
        this.state.value = event.target.value;
        this.changeTimeout = setTimeout(async () => {
            await this.formValue.setFormValue(this.state.value);
            this.formValue.dirty = false;
        }, 500);
    }

    public togglePasswordVisible(): void {
        if (this.state.isPassword) {
            this.state.isPasswordVisible = !this.state.isPasswordVisible;
        }
    }

    public getInputType(isPasswordVisible: boolean): string {
        if (isPasswordVisible) return InputFieldTypes.TEXT;
        return this.state.inputType;
    }

}

module.exports = Component;