/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ContextService } from './ContextService';
import { KIXObjectService } from './KIXObjectService';
import { DynamicFormFieldOption } from '../../../dynamic-fields/webapp/core';

export abstract class FormInputComponent<T, C extends FormInputComponentState> {

    protected state: C;

    private subscriber: IEventSubscriber;

    public onInput(input: FormInputComponentState): any {
        this.state.field = input.field;
        this.state.fieldId = input.fieldId;
        this.state.formId = input.formId;

        if (!this.state.fieldId) {
            this.state.fieldId = this.state.field ? this.state.field?.property : null;
        }

        FormInputComponent.prototype.doUpdate.call(this);

        return input;
    }

    private async doUpdate(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        this.state.formContext = formInstance?.getFormContext();
        this.state.field = formInstance?.getFormField(this.state.field?.instanceId);
        FormInputComponent.prototype.callSetInvalidState.call(this);
    }

    public async onMount(): Promise<void> {
        this.subscriber = {
            eventSubscriberId: `${this.state.field?.instanceId}_FormInputComponent`,
            eventPublished: async (data: any, eventId: string): Promise<void> => {
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
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(FormEvent.FORM_VALIDATED, this.subscriber);
        EventService.getInstance().subscribe(FormEvent.POSSIBLE_VALUE_CHANGED, this.subscriber);

        FormInputComponent.prototype.callSetInvalidState.call(this);
        await this.setCurrentValue();
        this.state.prepared = true;
    }

    private callSetInvalidState(): void {
        if (this.setInvalidState) {
            this.setInvalidState();
        } else {
            FormInputComponent.prototype.setInvalidState.call(this);
        }
    }

    public async onDestroy(): Promise<void> {
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(FormEvent.FORM_VALIDATED, this.subscriber);
        EventService.getInstance().unsubscribe(FormEvent.POSSIBLE_VALUE_CHANGED, this.subscriber);
    }

    public abstract setCurrentValue(): Promise<void>;

    public async setPossibleValue(): Promise<void> {
        return;
    }

    protected async provideValue(value: T, silent?: boolean): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        formInstance.provideFormFieldValues<any>(
            [[this.state.field?.instanceId, value]], this.state.field?.instanceId, silent
        );
    }

    protected async setInvalidState(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        if (formInstance && this.state.field) {
            const value = formInstance.getFormFieldValue(this.state.field?.instanceId);
            if (value) {
                this.state.invalid = !value.valid;
            }
        }
    }

    public async focusLost(event?: any): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        if (formInstance && formInstance.getForm().validation) {
            await formInstance.validateField(this.state.field);
            FormInputComponent.prototype.callSetInvalidState.call(this);
        }
    }
}
