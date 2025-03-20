/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { ObjectFormHandler } from '../../core/ObjectFormHandler';
import { ObjectFormEvent } from '../../../model/ObjectFormEvent';
import { FormLayoutFontSize } from '../../../model/layout/FormLayoutFontSize';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;
    private subscriber: IEventSubscriber;
    private formHandler: ObjectFormHandler;

    private updateTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.contextInstanceId = input.contextInstanceId;
    }

    public async onMount(): Promise<void> {
        if (this.state.contextInstanceId) {
            this.context = ContextService.getInstance().getContext(this.state.contextInstanceId);
            this.state.configurationMode = true;
        } else {
            this.context = ContextService.getInstance().getActiveContext();
        }

        this.formHandler = await this.context.getFormManager().getObjectFormHandler();

        if (this.formHandler.form.pages?.length) {
            this.formHandler.setActivePageId(this.formHandler.form.pages[0].id);
        }
        this.setFormValues();
        this.registerEventHandler();
    }

    private registerEventHandler(): void {
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('object-form'),
            eventPublished: async (data: Context | any, eventId: string): Promise<void> => {
                if (eventId === ObjectFormEvent.OBJECT_FORM_VALUE_MAPPER_INITIALIZED) {
                    this.state.prepared = true;
                } else if (
                    eventId === ObjectFormEvent.OBJECT_FORM_HANDLER_CHANGED ||
                    eventId === ObjectFormEvent.PAGE_ADDED ||
                    eventId === ObjectFormEvent.PAGE_DELETED
                ) {
                    this.updateForm();
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
        this.state.prepared = false;
        this.formHandler = await this.context?.getFormManager()?.getObjectFormHandler();
        this.state.pages = this.formHandler?.form.pages;
        (this as any).setStateDirty('pages');
        setTimeout(() => this.state.prepared = true, 50);
    }

    private setFormValues(resetCurrenPage: boolean = true): void {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(() => {
            if (this.formHandler) {
                this.state.pages = this.formHandler?.form.pages;
            } else {
                this.state.error = 'Translatable#No form available. Please contact your administrator.';
                console.error('No form available. Please contact your administrator.');
            }

            this.state.prepared = true;
        }, 50);
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