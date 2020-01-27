/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
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

class Component extends FormInputComponent<string | Date, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);

        this.state.currentValue = typeof input.currentValue !== 'undefined' ?
            input.currentValue : this.state.currentValue;
        if (this.state.field && this.state.field.options) {
            const typeOption = this.state.field.options.find(
                (o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE
            );
            if (typeOption) {
                this.state.inputType = typeOption.value.toString();
            }

            const minDateOption = this.state.field.options.find((o) => o.option === FormFieldOptions.MIN_DATE);
            this.state.minDate = minDateOption ? minDateOption.value : null;

            const maxDateOption = this.state.field.options.find((o) => o.option === FormFieldOptions.MAX_DATE);
            this.state.maxDate = maxDateOption ? maxDateOption.value : null;
        }
        this.update();
    }

    private async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';
        this.state.placeholder = await TranslationService.translate(placeholderText);

        // Firefox Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1446722
        // the clear action of date input did not trigger change event if element was not focused
        setTimeout(() => {
            const dateElement = (this as any).getEl('date-' + this.state.inputId);
            if (dateElement) {
                dateElement.focus();
                dateElement.blur();
            }
            const timeElement = (this as any).getEl('time-' + this.state.inputId);
            if (timeElement) {
                timeElement.focus();
                timeElement.blur();
            }
        }, 50);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.dateValue = null;
        this.state.timeValue = null;
        this.setCurrentValue();
    }

    public setCurrentValue(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentValue = new Date(this.state.defaultValue.value);
            this.state.dateValue = DateTimeUtil.getKIXDateString(this.state.currentValue);
            this.state.timeValue = DateTimeUtil.getKIXTimeString(this.state.currentValue, true);
            this.setValue();
        }
    }

    public dateChanged(event: any): void {
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
        const date = this.state.dateValue ? new Date(
            this.state.dateValue + (this.state.timeValue ? ` ${this.state.timeValue}` : '')
        ) : null;

        if (date && this.state.inputType !== 'DATE_TIME') {
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
