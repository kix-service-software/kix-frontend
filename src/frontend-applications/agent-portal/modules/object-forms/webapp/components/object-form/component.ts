/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;
    private subscriber: IEventSubscriber;
    private formhandler: ObjectFormHandler;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        await this.loadForm();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('object-form'),
            eventPublished: async (context: Context, eventId: string): Promise<void> => {
                if (
                    eventId === FormEvent.OBJECT_FORM_HANDLER_CHANGED &&
                    context.instanceId === this.context.instanceId
                ) {
                    this.state.prepared = false;
                    this.loadForm();
                    setTimeout(() => this.state.prepared = true, 5);
                } else if (eventId === ObjectFormEvent.FIELD_ORDER_CHANGED) {
                    this.state.prepared = false;
                    await this.setFormValues();
                    setTimeout(() => this.state.prepared = true, 5);
                }
            }
        };

        EventService.getInstance().subscribe(FormEvent.OBJECT_FORM_HANDLER_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.FIELD_ORDER_CHANGED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(FormEvent.OBJECT_FORM_HANDLER_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.FIELD_ORDER_CHANGED, this.subscriber);
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
                await ContextService.getInstance().toggleActiveContext(
                    this.context.descriptor.targetContextId, id, true
                );

                await BrowserUtil.openSuccessOverlay('Translatable#Success');
            }
        } catch (e) {
            setTimeout(() => this.state.prepared = true, 100);
        }
    }

    public async cancel(): Promise<void> {
        ContextService.getInstance().toggleActiveContext();
    }

}

module.exports = Component;