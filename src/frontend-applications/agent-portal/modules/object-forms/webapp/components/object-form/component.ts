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
import { ObjectFormHandler } from '../../core/ObjectFormHandler';
import { ObjectFormEvent } from '../../../model/ObjectFormEvent';
import { FormLayoutFontSize } from '../../../model/layout/FormLayoutFontSize';
import { ObjectFormEventData } from '../../../model/ObjectFormEventData';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { ObjectFormConfigurationContext } from '../../core/ObjectFormConfigurationContext';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private formHandler: ObjectFormHandler;

    public onCreate(input: any): void {
        super.onCreate(input, 'object-form');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

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

        if (this.formHandler?.objectFormValueMapper?.initialized) {
            this.state.prepared = true;
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        }

    }

    private registerEventHandler(): void {
        super.registerEventSubscriber(
            async function (data: ObjectFormEventData, eventId: string): Promise<void> {
                if (data.contextInstanceId !== this.contextInstanceId) return;
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
            },
            [
                ObjectFormEvent.OBJECT_FORM_HANDLER_CHANGED,
                ObjectFormEvent.OBJECT_FORM_VALUE_MAPPER_INITIALIZED,
                ObjectFormEvent.PAGE_ADDED,
                ObjectFormEvent.PAGE_DELETED
            ]
        );
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


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;