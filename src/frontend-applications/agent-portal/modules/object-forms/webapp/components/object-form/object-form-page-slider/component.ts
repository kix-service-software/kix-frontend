/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { ObjectFormEvent } from '../../../../model/ObjectFormEvent';
import { ObjectFormHandler } from '../../../core/ObjectFormHandler';
import { ComponentState } from './ComponentState';

declare const bootstrap: any;

export class Component extends AbstractMarkoComponent<ComponentState> {

    private formHandler: ObjectFormHandler;

    public onCreate(input: any): void {
        super.onCreate(input, 'object-form/object-form-page-slider');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.pages = input.pages || [];
        this.state.carouselId = input.carouselId;
        this.update();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.formHandler = await this.context.getFormManager().getObjectFormHandler();

        await this.update();

        this.state.activePageIndex = this.state.pages?.findIndex((p) => p.id === this.formHandler.activePageId) || 0;
        this.state.prepared = true;

        super.registerEventSubscriber(
            function (data: any, eventId: string): void {
                (this as any).setStateDirty('pages');

                if (eventId === ObjectFormEvent.PAGE_ADDED) {
                    this.setPage(this.formHandler?.form?.pages?.length - 1);
                }
            },
            [
                ObjectFormEvent.PAGE_UPDATED,
                ObjectFormEvent.PAGE_ADDED
            ]
        );
    }

    private async update(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Next', 'Translatable#Previous',
            ...this.state.pages.map((p) => p.name)
        ]);
    }


    private async setPage(index: number): Promise<void> {
        const formHandler = await this.context?.getFormManager()?.getObjectFormHandler();
        try {
            await formHandler.validateObjectFormPage(this.state.pages[this.state.activePageIndex].id);
        } catch (e) {
            console.warn(e);
            return;
        }
        this.state.activePageIndex = index;
        const page = this.state.pages[index];
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


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;