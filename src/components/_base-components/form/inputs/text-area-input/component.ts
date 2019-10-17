/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent, FormField, FormFieldValue } from '../../../../../core/model';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';
import { FormService, IdService } from '../../../../../core/browser';

class Component extends FormInputComponent<string, ComponentState> {

    private formListendenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.formListendenerId = IdService.generateDateBasedId('text-area-input');
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.setCurrentValue();
        FormService.getInstance().registerFormInstanceListener(this.state.formId, {
            formListenerId: this.formListendenerId,
            updateForm: () => { return; },
            formValueChanged: (formField: FormField, value: FormFieldValue<any>, oldValue: any) => {
                if (formField.instanceId === this.state.field.instanceId) {
                    this.state.currentValue = value.value;
                }
            }
        });
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
        if (this.state.formId && this.formListendenerId) {
            FormService.getInstance().removeFormInstanceListener(this.state.formId, this.formListendenerId);
        }
    }

    public setCurrentValue(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentValue = this.state.defaultValue.value;
            (this as any).emit('valueChanged', this.state.currentValue);
            super.provideValue(this.state.currentValue);
        }
    }

    public valueChanged(event: any): void {
        if (event) {
            this.state.currentValue = event.target && event.target.value !== '' ? event.target.value : null;
            (this as any).emit('valueChanged', this.state.currentValue);
            super.provideValue(this.state.currentValue);
        }
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
