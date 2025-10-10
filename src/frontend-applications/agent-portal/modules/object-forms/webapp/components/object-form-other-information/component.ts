/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ObjectFormHandler } from '../../core/ObjectFormHandler';
import { ComponentState } from './ComponentState';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ObjectFormEvent } from '../../../model/ObjectFormEvent';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private formhandler: ObjectFormHandler;
    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async onMount(): Promise<void> {
        await super.onMount(this.contextInstanceId);
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('object-form-other-information'),
            eventPublished: async (data: any, eventId: string): Promise<void> => {
                if (eventId === ObjectFormEvent.OTHER_INFORMATION_CHANGED) {
                    this.state.prepared = false;
                    this.update();
                }
            }
        };

        if (!this.contextInstanceId) {
            this.formhandler = await this.context?.getFormManager().getObjectFormHandler();
            this.update();
        }
        EventService.getInstance().subscribe(ObjectFormEvent.OTHER_INFORMATION_CHANGED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ObjectFormEvent.OTHER_INFORMATION_CHANGED, this.subscriber);
    }

    private update(): void {
        this.state.formValues = this.formhandler?.objectFormValueMapper?.getNotConfiguredFormValues() || [];
        this.state.formLayout = this.formhandler?.form?.formLayout;
        this.state.prepared = this.state.formValues?.filter((fv) => fv.enabled && fv.visible).length > 0;
    }

}

module.exports = Component;