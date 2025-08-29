/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { ObjectFormHandler } from '../../core/ObjectFormHandler';
import { ObjectFormEvent } from '../../../model/ObjectFormEvent';
import { FormLayoutFontSize } from '../../../model/layout/FormLayoutFontSize';
import { ObjectFormEventData } from '../../../model/ObjectFormEventData';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;
    private formHandler: ObjectFormHandler;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.contextInstanceId = input.contextInstanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount(this.state.contextInstanceId);

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
            loading: true, hint: 'Translatable#Load Form'
        });

        this.registerEventHandler();

        this.formHandler = await this.context.getFormManager().getObjectFormHandler();
        if (this.formHandler) {
            this.state.pages = this.formHandler?.form?.pages;

            if (this.state.pages?.length) {
                this.formHandler.setActivePageId(this.formHandler.form.pages[0].id);
            }
        } else {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        }

        if (this.formHandler.objectFormValueMapper.initialized) {
            this.state.prepared = true;
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        }

    }

    private registerEventHandler(): void {
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('object-form'),
            eventPublished: async (data: ObjectFormEventData, eventId: string): Promise<void> => {
                if (data.contextInstanceId === this.context?.instanceId) {
                    if (
                        this.state.prepared &&
                        (
                            eventId === ObjectFormEvent.OBJECT_FORM_HANDLER_CHANGED ||
                            eventId === ObjectFormEvent.PAGE_ADDED ||
                            eventId === ObjectFormEvent.PAGE_DELETED
                        )
                    ) {
                        this.updateForm();
                    } else if (eventId === ObjectFormEvent.OBJECT_FORM_VALUE_MAPPER_INITIALIZED) {
                        this.state.prepared = true;
                    }
                }
            }
        };

        EventService.getInstance().subscribe(ObjectFormEvent.OBJECT_FORM_HANDLER_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.OBJECT_FORM_VALUE_MAPPER_INITIALIZED, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.PAGE_ADDED, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.PAGE_DELETED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ObjectFormEvent.OBJECT_FORM_HANDLER_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.OBJECT_FORM_VALUE_MAPPER_INITIALIZED, this.subscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.PAGE_ADDED, this.subscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.PAGE_DELETED, this.subscriber);
    }

    private async updateForm(): Promise<void> {
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
            loading: true, hint: 'Translatable#Load Form'
        });
        this.state.prepared = false;
        this.formHandler = await this.context?.getFormManager()?.getObjectFormHandler();
        this.state.pages = this.formHandler?.form.pages;
        (this as any).setStateDirty('pages');
        setTimeout(() => this.state.prepared = true, 50);

        setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: false
            });
        }, 500);
    }

    public getLayoutClasses(): string {
        const classes: string[] = [];

        switch (this.formHandler?.form?.formLayout?.fontSize) {
            case FormLayoutFontSize.LARGE:
                classes.push('fs-4');
                break;
            case FormLayoutFontSize.MD:
                classes.push('fs-5');
                break;
            case FormLayoutFontSize.SMALL:
                classes.push('fs-6');
                break;
            default:
                classes.push('fs-6');
        }

        return classes.join(' ');
    }

}

module.exports = Component;