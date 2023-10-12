/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { DateTimeUtil } from '../../../../../modules/base-components/webapp/core/DateTimeUtil';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { TimeoutTimer } from '../../../../base-components/webapp/core/TimeoutTimer';
import { TicketService } from '../../core';

class Component extends FormInputComponent<Date, ComponentState> {

    private timoutTimer: TimeoutTimer;

    public onCreate(): void {
        this.state = new ComponentState();
        this.timoutTimer = new TimeoutTimer();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.setCurrentValue();
    }

    public async setCurrentValue(): Promise<void> {
        let date = new Date();
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<number>(this.state.field?.instanceId);
        if (value.value) {
            date = new Date(value.value);
        } else {
            date = await TicketService.getPendingDateDiff();
        }

        this.state.selectedDate = DateTimeUtil.getKIXDateString(date);
        this.state.selectedTime = DateTimeUtil.getKIXTimeString(date, true, true);
    }

    public dateChanged(event: any): void {
        this.timoutTimer.restartTimer(() => this.setDateChanged(event));
    }

    private setDateChanged(event: any): void {
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
