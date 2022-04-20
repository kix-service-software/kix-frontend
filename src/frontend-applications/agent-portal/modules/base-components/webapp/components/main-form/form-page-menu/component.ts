/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { EventService } from '../../../core/EventService';
import { IdService } from '../../../../../../model/IdService';
import { IEventSubscriber } from '../../../core/IEventSubscriber';

class Component {

    private state: ComponentState;
    private eventSubscriber: IEventSubscriber;
    private keyUpEventFunction: () => {
        // do nothing ...
    };

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.activePageIndex = input.activePageIndex;
        this.state.pages = input.pages;
        this.prepareTranslations();
    }

    public async onMount(): Promise<void> {
        this.prepareTranslations();
        this.eventSubscriber = {
            eventSubscriberId: IdService.generateDateBasedId('page-subscriber-'),
            eventPublished: (): void => {
                this.state.pageChanged = true;
            }
        };
        EventService.getInstance().subscribe('PAGE_CHANGED', this.eventSubscriber);
    }

    public onDestroy(): void {
        if (this.keyUpEventFunction) {
            document.body.removeEventListener('keyup', this.keyUpEventFunction, false);
        }
        if (this.eventSubscriber) {
            EventService.getInstance().unsubscribe('PAGE_CHANGED', this.eventSubscriber);
        }
    }

    public keyUp(event: any): void {
        if (
            this.state.pages && this.state.pages.length > 1
            && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')
            && event.ctrlKey
        ) {
            if (event.key === 'ArrowRight') {
                this.showPage(this.state.activePageIndex + 1);
            } else {
                this.showPage(this.state.activePageIndex - 1);
            }
        }
    }

    private async prepareTranslations(): Promise<void> {
        if (this.state.pages && this.state.pages.length) {
            this.state.translations = await TranslationService.createTranslationObject([
                'Translatable#Next', 'Translatable#Previous',
                ...this.state.pages.map((p) => p.name)
            ]);
            const activePage = this.state.pages[this.state.activePageIndex];
            if (activePage) {
                this.state.activePageTitle = this.state.translations[activePage.name];
                this.state.pageChanged = false;
            }
            this.state.prepared = true;
        }
    }

    public showPage(index: number): void {
        EventService.getInstance().publish('PAGE_CHANGED');
        (this as any).emit('showPage', index);
    }
}

module.exports = Component;
