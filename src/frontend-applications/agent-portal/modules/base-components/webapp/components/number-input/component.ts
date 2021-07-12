/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { NumberInputOptions } from '../../../../../modules/base-components/webapp/core/NumberInputOptions';
import { ContextService } from '../../core/ContextService';

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);

        this.state.currentValue = typeof input.currentValue !== 'undefined' ?
            input.currentValue : this.state.currentValue;
        this.update();
    }

    private async update(): Promise<void> {
        const placeholderText = this.state.field?.placeholder
            ? this.state.field?.placeholder
            : this.state.field?.required ? this.state.field?.label : '';
        this.state.placeholder = await TranslationService.translate(placeholderText);
        this.prepareOptions();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    private async prepareOptions(): Promise<void> {
        if (this.state.field && this.state.field?.options) {
            const maxOption = this.state.field?.options.find(
                (o) => o.option === NumberInputOptions.MAX
            );
            if (maxOption) {
                this.state.max = maxOption.value;
            }
            const minOption = this.state.field?.options.find(
                (o) => o.option === NumberInputOptions.MIN
            );
            if (minOption) {
                const exceptsEmpty = this.state.field?.options.find(
                    (o) => o.option === NumberInputOptions.EXCEPTS_EMPTY
                );
                this.state.min = minOption.value;
                if (
                    (typeof this.state.currentValue === 'undefined' || this.state.currentValue === null)
                    && (!exceptsEmpty || !exceptsEmpty.value)
                ) {
                    this.state.currentValue = this.state.min.toString();
                }
            }
            const stepOption = this.state.field?.options.find(
                (o) => o.option === NumberInputOptions.STEP
            );
            if (stepOption) {
                this.state.step = stepOption.value;
            }
            const unitStringOption = this.state.field?.options.find(
                (o) => o.option === NumberInputOptions.UNIT_STRING
            );
            if (unitStringOption) {
                const string = await TranslationService.translate(unitStringOption.value);
                this.state.unitString = ` ${string}`;
            }
        }
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

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
