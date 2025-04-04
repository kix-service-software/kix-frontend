/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { ObjectFormEvent } from '../../../../model/ObjectFormEvent';
import { ObjectFormHandler } from '../../../core/ObjectFormHandler';
import { ComponentState } from './ComponentState';

declare const bootstrap: any;

export class Component extends AbstractMarkoComponent<ComponentState> {

    private contextInstanceId: string;
    private context: Context;
    private formHandler: ObjectFormHandler;
    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.pages = input.pages || [];
        this.state.carouselId = input.carouselId;
        this.contextInstanceId = input.contextInstanceId;
        this.update();
    }

    public async onMount(): Promise<void> {
        if (this.contextInstanceId) {
            this.context = ContextService.getInstance().getContext(this.contextInstanceId);
        } else {
            this.context = ContextService.getInstance().getActiveContext();
        }

        this.formHandler = await this.context.getFormManager().getObjectFormHandler();

        await this.update();

        this.state.activePageIndex = this.state.pages?.findIndex((p) => p.id === this.formHandler.activePageId) || 0;
        this.state.prepared = true;

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                (this as any).setStateDirty('pages');

                if (eventId === ObjectFormEvent.PAGE_ADDED) {
                    this.setPage(this.formHandler?.form?.pages?.length - 1);
                }
            }
        };

        EventService.getInstance().subscribe(ObjectFormEvent.PAGE_UPDATED, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.PAGE_ADDED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ObjectFormEvent.PAGE_UPDATED, this.subscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.PAGE_ADDED, this.subscriber);
    }

    private async update(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Next', 'Translatable#Previous',
            ...this.state.pages.map((p) => p.name)
        ]);
    }

    private async setPage(index: number): Promise<void> {
        this.state.activePageIndex = index;
        const page = this.state.pages[index];
        this.state.title = page?.name;
        const formHandler = await this.context?.getFormManager()?.getObjectFormHandler();
        formHandler?.setActivePageId(page?.id);
    }

    public previousPage(): void {
        let index = 0;
        if (this.state.activePageIndex === 0) {
            index = this.state.pages.length - 1;
        } else {
            index === this.state.activePageIndex - 1;
        }

        this.setPage(index);
    }

    public nextPage(): void {
        let index = 0;
        if (this.state.activePageIndex === this.state.pages.length - 1) {
            index = 0;
        } else {
            index = this.state.activePageIndex + 1;
        }

        this.setPage(index);
    }

}

module.exports = Component;