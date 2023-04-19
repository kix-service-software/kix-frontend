/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../model/Context';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { DateTimeUtil } from '../../../../../base-components/webapp/core/DateTimeUtil';
import { InputFieldTypes } from '../../../../../base-components/webapp/core/InputFieldTypes';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { DateTimeFormValue } from '../../../../model/FormValues/DateTimeFormValue';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ObjectFormHandler } from '../../../core/ObjectFormHandler';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: DateTimeFormValue;
    private context: Context;
    private formHandler: ObjectFormHandler;
    private timeValueChanged: boolean;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.formValue?.instanceId !== input.formValue?.instanceId) {
            this.formValue?.removePropertyBinding(this.bindingIds);
            this.formValue = input.formValue;
            this.update();
        }
    }

    private async update(): Promise<void> {
        this.bindingIds = [];

        this.bindingIds.push(
            this.formValue.addPropertyBinding(FormValueProperty.READ_ONLY, (formValue: ObjectFormValue) => {
                this.state.readonly = formValue.readonly;
            })
        );

        this.state.readonly = this.formValue?.readonly;
    }

    public async onMount(): Promise<void> {
        this.timeValueChanged = false;
        this.context = ContextService.getInstance().getActiveContext();
        this.formHandler = await this.context.getFormManager().getObjectFormHandler();
        this.state.inputType = this.formValue?.inputType || InputFieldTypes.DATE;

        if (this.formValue.value) {
            this.state.dateValue = DateTimeUtil.getKIXDateString(new Date(this.formValue.value?.toString()));

            if (this.state.inputType === InputFieldTypes.DATE_TIME) {
                this.state.timeValue = DateTimeUtil.getKIXTimeString(new Date(this.formValue.value?.toString()));
            }
        }

        if (this.formValue.minDate) {
            this.state.minDate = DateTimeUtil.getKIXDateString(new Date(this.formValue.minDate));
        }

        if (this.formValue.maxDate) {
            this.state.maxDate = DateTimeUtil.getKIXDateString(new Date(this.formValue.maxDate));
        }

        this.state.prepared = true;
    }

    public onDestroy(): void {
        this.formValue?.removePropertyBinding(this.bindingIds);
    }

    public dateChanged(event: any): void {
        if (event) {
            this.state.dateValue = event?.target?.value ? event.target.value : null;
            this.setValue();
        }
    }

    public timeChanged(event: any): void {
        if (event) {
            this.state.timeValue = event?.target?.value ? event.target.value : null;
            this.setValue();
            this.timeValueChanged = true;
        }
    }

    private setValue(): void {
        let date: Date;

        const hasValue = this.formValue.value !== null || this.formValue.value !== undefined;
        const isDate = this.formValue.inputType === InputFieldTypes.DATE;
        const isDateTime = this.formValue.inputType === InputFieldTypes.DATE_TIME;

        if (isDate && this.state.dateValue) {
            date = new Date(this.state.dateValue);
            date.setHours(0, 0, 0, 0);
        } else if (isDateTime) {
            const dateTimeString = `${this.state.dateValue} ${this.state.timeValue}`;
            const timestamp = Date.parse(dateTimeString);
            if (!isNaN(timestamp)) {
                date = new Date(dateTimeString);
            }
        }

        if (isDate || (isDateTime && (this.timeValueChanged || hasValue))) {
            const value = date ? DateTimeUtil.getKIXDateTimeString(date) : null;
            this.formValue.setFormValue(value);

            if (!value) {
                this.formHandler.objectFormValidator?.validate(this.formValue, true);
            }
        }
    }

    public async focusLost(event?: any): Promise<void> {
        // TODO: dirty hack to trigger validation
        this.setValue();
    }

}

module.exports = Component;
