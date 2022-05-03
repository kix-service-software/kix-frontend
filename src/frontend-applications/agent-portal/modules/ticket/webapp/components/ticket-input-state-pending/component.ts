/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { DateTimeUtil } from '../../../../../modules/base-components/webapp/core/DateTimeUtil';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { SysConfigOption } from '../../../../sysconfig/model/SysConfigOption';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { SysConfigKey } from '../../../../sysconfig/model/SysConfigKey';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { TimeoutTimer } from '../../../../base-components/webapp/core/TimeoutTimer';

class Component extends FormInputComponent<Date, ComponentState> {

    private timoutTimer: TimeoutTimer = new TimeoutTimer();

    public onCreate(): void {
        this.state = new ComponentState();
        // this.timoutTimer = new TimeoutTimer();
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
            let offset = 86400;

            const offsetConfig = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_FRONTEND_PENDING_DIFF_TIME], null, null, true
            ).catch((error): SysConfigOption[] => []);

            if (Array.isArray(offsetConfig) && offsetConfig[0].Value) {
                offset = offsetConfig[0].Value;
            }

            date.setSeconds(date.getSeconds() + Number(offset));
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
