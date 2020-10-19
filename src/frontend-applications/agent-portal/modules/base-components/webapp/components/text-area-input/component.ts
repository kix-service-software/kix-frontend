/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { FormService } from '../../core/FormService';

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
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
        if (this.state.field && this.state.field.options) {
            const rowOption = this.state.field.options.find(
                (o) => o.option === 'ROWS'
            );
            if (rowOption && !isNaN(Number(rowOption.value)) && rowOption.value > 0) {
                this.state.rows = Number(rowOption.value);
            } else {
                this.state.rows = 5;
            }
        }
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
    }

    public async setCurrentValue(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const value = formInstance.getFormFieldValue<string>(this.state.field.instanceId);
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

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
