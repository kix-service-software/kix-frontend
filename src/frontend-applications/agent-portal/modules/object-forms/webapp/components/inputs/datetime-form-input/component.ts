/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../model/Context';
import { IdService } from '../../../../../../model/IdService';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { DateTimeUtil } from '../../../../../base-components/webapp/core/DateTimeUtil';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { InputFieldTypes } from '../../../../../base-components/webapp/core/InputFieldTypes';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { DateTimeFormValue } from '../../../../model/FormValues/DateTimeFormValue';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ObjectFormEvent } from '../../../../model/ObjectFormEvent';
import { ObjectFormHandler } from '../../../core/ObjectFormHandler';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: DateTimeFormValue;
    private context: Context;
    private formHandler: ObjectFormHandler;

    private subscriber: IEventSubscriber;

    private value: string;

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

        this.updateValue();
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        this.formHandler = await this.context.getFormManager().getObjectFormHandler();
        this.state.inputType = this.formValue?.inputType || InputFieldTypes.DATE;

        this.value = this.formValue?.value;
        if (this.formValue?.value) {
            this.formHandler.objectFormValidator?.validate(this.formValue, true);
        }

        this.updateValue();

        if (this.formValue.minDate) {
            this.state.minDate = DateTimeUtil.getKIXDateString(new Date(this.formValue.minDate));
        }

        if (this.formValue.maxDate) {
            this.state.maxDate = DateTimeUtil.getKIXDateString(new Date(this.formValue.maxDate));
        }

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                if (data.blocked) {
                    this.state.readonly = true;
                } else {
                    this.state.readonly = this.formValue.readonly;
                }
            }
        };
        EventService.getInstance().subscribe(ObjectFormEvent.BLOCK_FORM, this.subscriber);

        this.state.prepared = true;
    }

    private updateValue(): void {
        if (this.value) {
            this.state.dateValue = DateTimeUtil.getKIXDateString(new Date(this.value?.toString()));

            if (this.state.inputType === InputFieldTypes.DATE_TIME) {
                this.state.timeValue = DateTimeUtil.getKIXTimeString(new Date(this.value?.toString()));
            }
        }
    }

    public onDestroy(): void {
        this.formValue?.removePropertyBinding(this.bindingIds);
        EventService.getInstance().unsubscribe(ObjectFormEvent.BLOCK_FORM, this.subscriber);
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
        let date: Date;

        const isDate = this.formValue.inputType === InputFieldTypes.DATE;
        const isDateTime = this.formValue.inputType === InputFieldTypes.DATE_TIME;

        if (isDate && this.state.dateValue) {
            date = new Date(this.state.dateValue);
            date.setHours(0, 0, 0, 0);
        } else if (isDateTime) {
            if (!this.state.timeValue) {
                this.state.timeValue = DateTimeUtil.getKIXTimeString(new Date());
            }
            const dateTimeString = `${this.state.dateValue} ${this.state.timeValue}`;
            date = new Date(dateTimeString);
        }

        this.value = date ? DateTimeUtil.getKIXDateTimeString(date) : null;
    }

    public async focusLost(event?: any): Promise<void> {
        const hasValue = this.value !== null && this.value !== undefined;
        if (hasValue) {
            this.formValue.setFormValue(this.value);
        }

        if (!this.value) {
            this.formHandler.objectFormValidator?.validate(this.formValue, true);
        }
    }

}

module.exports = Component;
