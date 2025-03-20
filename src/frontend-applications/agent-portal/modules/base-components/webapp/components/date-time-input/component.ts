/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { DateTimeUtil } from '../../../../../modules/base-components/webapp/core/DateTimeUtil';
import { ContextService } from '../../core/ContextService';
import { InputFieldTypes } from '../../core/InputFieldTypes';
import { TimeoutTimer } from '../../core/TimeoutTimer';

class Component extends FormInputComponent<string | Date, ComponentState> {

    private timoutTimer: TimeoutTimer;

    public onCreate(): void {
        this.state = new ComponentState();
        this.timoutTimer = new TimeoutTimer();
    }

    public onInput(input: any): void {
        super.onInput(input);

        this.state.currentValue = typeof input.currentValue !== 'undefined' ?
            input.currentValue : this.state.currentValue;
        if (this.state.field && this.state.field?.options) {
            const typeOption = this.state.field?.options.find(
                (o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE
            );
            if (typeOption) {
                this.state.inputType = typeOption.value.toString();
            }
            else {
                this.state.inputType = InputFieldTypes.DATE_TIME;
            }

            const minDateOption = this.state.field?.options.find((o) => o.option === FormFieldOptions.MIN_DATE);
            this.state.minDate = minDateOption ? DateTimeUtil.getKIXDateString(new Date(minDateOption.value)) : null;

            const maxDateOption = this.state.field?.options.find((o) => o.option === FormFieldOptions.MAX_DATE);
            this.state.maxDate = maxDateOption ? DateTimeUtil.getKIXDateString(new Date(maxDateOption.value)) : null;
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
        this.state.prepared = false;
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<string>(this.state.field?.instanceId);
        if (value && value.value) {
            const currentValue = new Date(value.value);
            if (currentValue.getTime()) {
                this.state.currentValue = currentValue;
                this.state.dateValue = DateTimeUtil.getKIXDateString(this.state.currentValue);
                this.state.timeValue = DateTimeUtil.getKIXTimeString(this.state.currentValue, true);
            }
        }

        setTimeout(() => {
            this.state.prepared = true;
        }, 50);
    }

    public dateChanged(event: any): void {
        this.timoutTimer.restartTimer(() => this.setDateValue(event));
    }

    private setDateValue(event: any): void {
        if (event) {
            this.state.dateValue = event.target && event.target.value !== '' ? event.target.value : null;
            this.setValue();
        }
    }

    public timeChanged(event: any): void {
        if (event) {
            this.state.timeValue = event.target && event.target.value !== '' ? event.target.value : null;
            this.setValue();
        }
    }

    private setValue(): void {
        const dateValue = this.state.dateValue;

        const date = new Date(
            dateValue + (
                this.state.timeValue && this.state.timeValue.match(/^\d\d:\d\d/) ?
                    ` ${this.state.timeValue}` : ''
            )
        );

        if (date && this.state.inputType === InputFieldTypes.DATE) {
            date.setHours(0, 0, 0, 0);
        }

        this.state.currentValue = date;

        (this as any).emit('valueChanged', this.state.currentValue);
        super.provideValue(this.state.currentValue);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
