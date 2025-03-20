/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { IdService } from '../../../../../model/IdService';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { ObjectFormValue } from '../../../model/FormValues/ObjectFormValue';
import { ObjectFormEvent } from '../../../model/ObjectFormEvent';
import { ObjectFormHandler } from '../../core/ObjectFormHandler';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;
    private subscriber: IEventSubscriber;
    private contextListenerId: string;
    private contextInstanceId: string;
    private formhandler: ObjectFormHandler;
    private submitTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.contextInstanceId = input.contextInstanceId;
    }

    public async onMount(): Promise<void> {
        if (this.contextInstanceId) {
            this.context = ContextService.getInstance().getContext(this.contextInstanceId);
        } else {
            this.context = ContextService.getInstance().getActiveContext();
        }

        this.formhandler = await this.context.getFormManager().getObjectFormHandler();

        this.prepareSubmitButton();
        this.registerListener();

        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ObjectFormEvent.BLOCK_FORM, this.subscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.FORM_SUBMIT_ENABLED, this.subscriber);
        this.context?.unregisterListener(this.contextListenerId);
    }

    private registerListener(): void {
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('object-form-buttonbar'),
            eventPublished: async (data: Context | any, eventId: string): Promise<void> => {
                if (eventId === ObjectFormEvent.FORM_SUBMIT_ENABLED) {
                    this.state.canSubmit = data;
                } else if (eventId === ObjectFormEvent.BLOCK_FORM) {
                    this.state.blocked = data.blocked;
                }
            }
        };

        this.contextListenerId = IdService.generateDateBasedId('object-forms-buttonbar');
        this.context.registerListener(this.contextListenerId, {
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

        EventService.getInstance().subscribe(ObjectFormEvent.BLOCK_FORM, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.FORM_SUBMIT_ENABLED, this.subscriber);
    }

    private prepareSubmitButton(): void {
        const submitButtonText = this.context?.getAdditionalInformation(
            AdditionalContextInformation.DIALOG_SUBMIT_BUTTON_TEXT
        );
        if (submitButtonText) {
            this.state.submitPattern = submitButtonText;
        }
    }

    public async submit(): Promise<void> {
        try {
            if (!this.state.blocked) {
                await this.sendSubmit();
            }
        } catch (e) {
            this.state.prepared = true;

            setTimeout(() => {
                const invalidFormValue = this.getFirstInvalidFormValue(this.formhandler?.getFormValues());
                EventService.getInstance().publish(ObjectFormEvent.SCROLL_TO_FORM_VALUE, invalidFormValue?.instanceId);
            }, 25);
        }
    }

    private async sendSubmit(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
            }
            this.submitTimeout = setTimeout(async () => {
                this.state.prepared = false;

                try {
                    const id = await this.formhandler?.commit();
                    if (id) {

                        await ContextService.getInstance().removeContext(
                            this.context?.instanceId, this.context?.descriptor?.targetContextId, id, true, true, true
                        );

                        await BrowserUtil.openSuccessOverlay('Translatable#Success');
                    }
                    resolve();
                } catch (e) {
                    reject(e);
                }
            }, 1000);
        });
    }

    private getFirstInvalidFormValue(formValues: ObjectFormValue[]): ObjectFormValue {
        for (const fv of formValues) {
            if (!fv.valid) {
                return fv;
            }

            if (fv.formValues?.length) {
                const subFV = this.getFirstInvalidFormValue(fv.formValues);
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