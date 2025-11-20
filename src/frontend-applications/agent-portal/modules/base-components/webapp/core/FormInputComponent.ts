/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState } from './FormInputComponentState';
import { EventService } from './EventService';
import { FormEvent } from './FormEvent';
import { IEventSubscriber } from './IEventSubscriber';
import { FormValuesChangedEventData } from './FormValuesChangedEventData';
import { KIXObjectService } from './KIXObjectService';
import { DynamicFormFieldOption } from '../../../dynamic-fields/webapp/core';
import { Context } from '../../../../model/Context';
import { AbstractMarkoComponent } from './AbstractMarkoComponent';

export abstract class FormInputComponent<T, CS extends FormInputComponentState>
    extends AbstractMarkoComponent<CS, Context> {

    public onCreate(input: any, eventSubscriberPrefix: string = ''): void {
        if (typeof this.prepareMount !== 'function') {
            this.prepareMount = FormInputComponent.prototype.prepareMount.bind(this);
        }

        super.onCreate(input, eventSubscriberPrefix);
    }

    public onInput(input: FormInputComponentState): any {
        super.onInput(input);
        this.state.field = input.field;
        this.state.fieldId = input.fieldId;
        this.state.formId = input.formId;

        if (!this.state.fieldId) {
            this.state.fieldId = this.state.field ? this.state.field?.property : null;
        }

        return input;
    }

    private async doUpdate(): Promise<void> {
        const formInstance = await this.context?.getFormManager()?.getFormInstance();
        this.state.formContext = formInstance?.getFormContext();
        this.state.field = formInstance?.getFormField(this.state.field?.instanceId);
        FormInputComponent.prototype.callSetInvalidState.call(this);
    }

    public async onMount(setPrepared: boolean = true): Promise<void> {
        await super.onMount();

        FormInputComponent.prototype.doUpdate.call(this);

        const subscriber: IEventSubscriber = {
            eventSubscriberId: 'FormInputComponent/' + super.getEventSubscriberId(),
            eventPublished: async function (data: any, eventId: string): Promise<void> {
                if (data?.formInstance?.getForm()?.id === this.state.formId) {
                    if (eventId === FormEvent.VALUES_CHANGED && this.state.field && data) {
                        const changedData: FormValuesChangedEventData = data;
                        if (changedData.originInstanceId !== this.state.field?.instanceId) {
                            const ownValue = changedData.changedValues.find(
                                (cv) => cv[0] && cv[0].instanceId === this.state.field?.instanceId
                            );
                            if (ownValue) {
                                this.state.prepared = false;
                                this.setCurrentValue();
                                this.state.field = changedData.formInstance.getFormField(this.state.field?.instanceId);
                                FormInputComponent.prototype.callSetInvalidState.call(this);
                                setTimeout(() => this.state.prepared = true, 10);
                            }
                        } else {
                            FormInputComponent.prototype.callSetInvalidState.call(this);
                        }
                    } else if (
                        eventId === FormEvent.FORM_VALIDATED ||
                        (eventId === FormEvent.FIELD_VALIDATED && data?.instanceId === this.state.field?.instanceId)
                    ) {
                        FormInputComponent.prototype.callSetInvalidState.call(this);
                    } else if (eventId === FormEvent.POSSIBLE_VALUE_CHANGED && this.state.field && data) {
                        const dfName = KIXObjectService.getDynamicFieldName(data.property);
                        if (dfName) {
                            const option = this.state.field.options?.find(
                                (o) => o.option === DynamicFormFieldOption.FIELD_NAME
                            );
                            if (option?.value === dfName) {
                                this.setPossibleValue();
                            }
                        } else if (data.property === this.state.field.property) {
                            this.setPossibleValue();
                        }
                    }
                }
            }.bind(this)
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, subscriber);
        EventService.getInstance().subscribe(FormEvent.FORM_VALIDATED, subscriber);
        EventService.getInstance().subscribe(FormEvent.POSSIBLE_VALUE_CHANGED, subscriber);

        FormInputComponent.prototype.callSetInvalidState.call(this);
        await this.setCurrentValue();
        if (setPrepared) {
            this.state.prepared = true;
        }
    }

    protected async prepareMount(): Promise<void> {
        await super.prepareMount();
    }

    protected setComponentContext(context: Context): void {
        const oldEventSubscriberId = super.getEventSubscriberId();
        super.setComponentContext(context);
        const newEventSubscriberId = super.getEventSubscriberId();
        if (oldEventSubscriberId !== newEventSubscriberId) {
            EventService.getInstance().renameSubscriber(oldEventSubscriberId, newEventSubscriberId);
        }
    }

    private callSetInvalidState(): void {
        if (this.setInvalidState) {
            this.setInvalidState();
        } else {
            FormInputComponent.prototype.setInvalidState.call(this);
        }
    }

    public onDestroy(): void {
        super.onDestroy();
        EventService.getInstance().unsubscribeSubscriber('FormInputComponent/' + super.getEventSubscriberId());
    }

    public abstract setCurrentValue(): Promise<void>;

    public async setPossibleValue(): Promise<void> {
        return;
    }

    protected async provideValue(value: T, silent?: boolean): Promise<void> {
        const formInstance = await this.context?.getFormManager()?.getFormInstance();
        formInstance.provideFormFieldValues<any>(
            [[this.state.field?.instanceId, value]], this.state.field?.instanceId, silent
        );
    }

    protected async setInvalidState(): Promise<void> {
        const formInstance = await this.context?.getFormManager()?.getFormInstance();
        if (formInstance && this.state.field) {
            const value = formInstance.getFormFieldValue(this.state.field?.instanceId);
            if (value) {
                this.state.invalid = !value.valid;
            }
        }
    }

    public async focusLost(event?: any): Promise<void> {
        const formInstance = await this.context?.getFormManager()?.getFormInstance();
        if (formInstance?.getForm().validation) {
            await formInstance.validateField(this.state.field);
            FormInputComponent.prototype.callSetInvalidState.call(this);
        }
    }
}
