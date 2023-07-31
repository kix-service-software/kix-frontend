/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Context } from '../../../../../model/Context';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { ObjectFormHandler } from '../../core/ObjectFormHandler';
import { ObjectFormEvent } from '../../../model/ObjectFormEvent';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { ObjectFormValue } from '../../../model/FormValues/ObjectFormValue';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;
    private subscriber: IEventSubscriber;
    private formhandler: ObjectFormHandler;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();

        this.context.registerListener(IdService.generateDateBasedId('object-forms'), {
            additionalInformationChanged: (key: string, value: any) => {
                if (key === AdditionalContextInformation.DIALOG_SUBMIT_BUTTON_TEXT) {
                    this.state.submitPattern = value;
                }
            },
            filteredObjectListChanged: () => null,
            objectChanged: () => null,
            objectListChanged: () => null,
            scrollInformationChanged: () => null,
            sidebarLeftToggled: () => null,
            sidebarRightToggled: () => null
        });

        const submitButtonText = this.context?.getAdditionalInformation(
            AdditionalContextInformation.DIALOG_SUBMIT_BUTTON_TEXT
        );
        if (submitButtonText) {
            this.state.submitPattern = submitButtonText;
        }

        await this.loadForm();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('object-form'),
            eventPublished: async (data: Context | any, eventId: string): Promise<void> => {
                if (
                    (
                        eventId === FormEvent.OBJECT_FORM_HANDLER_CHANGED ||
                        eventId === ObjectFormEvent.FORM_VALUE_ADDED
                    ) &&
                    data.instanceId === this.context.instanceId
                ) {
                    this.state.prepared = false;
                    this.loadForm();
                    setTimeout(() => this.state.prepared = true, 5);
                } else if (eventId === ObjectFormEvent.FIELD_ORDER_CHANGED) {
                    this.state.prepared = false;
                    await this.setFormValues();
                    setTimeout(() => this.state.prepared = true, 5);
                } else if (eventId === ObjectFormEvent.BLOCK_FORM) {
                    BrowserUtil.toggleLoadingShield('OBJECT_FORM_SHIELD', data.blocked);
                }
            }
        };

        EventService.getInstance().subscribe(FormEvent.OBJECT_FORM_HANDLER_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.FIELD_ORDER_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.BLOCK_FORM, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.FORM_VALUE_ADDED, this.subscriber);

        BrowserUtil.toggleLoadingShield('OBJECT_FORM_SHIELD', true);
        setTimeout(() => BrowserUtil.toggleLoadingShield('OBJECT_FORM_SHIELD', false), 250);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(FormEvent.OBJECT_FORM_HANDLER_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.FIELD_ORDER_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.BLOCK_FORM, this.subscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.FORM_VALUE_ADDED, this.subscriber);
    }

    private async loadForm(): Promise<void> {
        await this.setFormValues();
    }

    private async setFormValues(): Promise<void> {
        this.formhandler = await this.context.getFormManager().getObjectFormHandler();
        this.state.formValues = this.formhandler?.getFormValues() || [];
    }

    public async submit(): Promise<void> {
        try {
            this.state.prepared = false;

            const id = await this.formhandler.commit();
            if (id) {

                await ContextService.getInstance().removeContext(
                    this.context?.instanceId, this.context?.descriptor?.targetContextId, id, true, true, true
                );

                await BrowserUtil.openSuccessOverlay('Translatable#Success');
            }
        } catch (e) {
            this.state.prepared = true;

            setTimeout(() => {
                const invalidFormValue = this.getFirstInvlaidFOrmValue(this.formhandler.getFormValues());
                EventService.getInstance().publish(ObjectFormEvent.SCROLL_TO_FORM_VALUE, invalidFormValue?.instanceId);
            }, 25);
        }
    }

    private getFirstInvlaidFOrmValue(formValues: ObjectFormValue[]): ObjectFormValue {
        for (const fv of formValues) {
            if (!fv.valid) {
                return fv;
            }

            if (fv.formValues?.length) {
                const subFV = this.getFirstInvlaidFOrmValue(fv.formValues);
                if (subFV) {
                    return subFV;
                }
            }
        }
    }

    public async cancel(): Promise<void> {
        ContextService.getInstance().toggleActiveContext();
    }

}

module.exports = Component;