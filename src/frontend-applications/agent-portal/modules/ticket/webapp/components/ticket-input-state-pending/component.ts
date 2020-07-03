/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { DateTimeUtil } from '../../../../../modules/base-components/webapp/core/DateTimeUtil';
import { FormService } from '../../../../base-components/webapp/core/FormService';

class Component extends FormInputComponent<Date, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.setCurrentValue();
    }

    public async setCurrentValue(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const value = formInstance.getFormFieldValue<number>(this.state.field.instanceId);
        if (value) {
            const pendingDate = new Date(value.value);
            this.state.selectedDate = DateTimeUtil.getKIXDateString(pendingDate);
            this.state.selectedTime = DateTimeUtil.getKIXTimeString(pendingDate);
        }
    }

    public dateChanged(event: any): void {
        this.state.selectedDate = event.target.value;
        this.setValue();
    }

    public timeChanged(event: any): void {
        this.state.selectedTime = event.target.value;
        this.setValue();
    }

    private setValue(): void {
        const pendingDate = new Date(`${this.state.selectedDate} ${this.state.selectedTime}`);
        super.provideValue(pendingDate);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
