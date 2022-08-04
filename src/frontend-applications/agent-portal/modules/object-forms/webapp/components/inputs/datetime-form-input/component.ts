/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { DateTimeUtil } from '../../../../../base-components/webapp/core/DateTimeUtil';
import { InputFieldTypes } from '../../../../../base-components/webapp/core/InputFieldTypes';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { DateTimeFormValue } from '../../../../model/FormValues/DateTimeFormValue';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: DateTimeFormValue;

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
        this.state.inputType = this.formValue?.inputType || InputFieldTypes.DATE;
        this.state.dateValue = DateTimeUtil.getKIXDateString(new Date(this.formValue.value?.toString()));

        if (this.state.inputType === InputFieldTypes.DATE_TIME) {
            this.state.timeValue = DateTimeUtil.getKIXTimeString(new Date(this.formValue.value?.toString()));
        }
        this.state.minDate = this.formValue.minDate ?
            DateTimeUtil.getKIXDateString(new Date(this.formValue.minDate)) : null;
        this.state.maxDate = this.formValue.maxDate ?
            DateTimeUtil.getKIXDateString(new Date(this.formValue.maxDate)) : null;
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
        }
    }

    private setValue(): void {
        const dateValue = this.state.dateValue || '2000-01-01';

        const time = (this.state.timeValue ? ` ${this.state.timeValue}` : '');
        const date = new Date(dateValue + time);

        if (date && this.formValue.inputType === InputFieldTypes.DATE) {
            date.setHours(0, 0, 0, 0);
        }

        const value = DateTimeUtil.getKIXDateTimeString(date);
        this.formValue.setFormValue(value);
    }

    public async focusLost(event?: any): Promise<void> {
        // TODO: dirty hack to trigger validation
        this.setValue();
    }

}

module.exports = Component;
