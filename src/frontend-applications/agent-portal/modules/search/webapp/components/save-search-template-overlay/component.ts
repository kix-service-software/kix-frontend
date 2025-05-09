/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { SearchService } from '../../core/SearchService';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { SearchContext } from '../../core/SearchContext';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';

declare const bootstrap: any;

class Component extends AbstractMarkoComponent<ComponentState> {

    public loadedSearchId: string;
    private titleTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Title', 'Translatable#Cancel', 'Translatable#Save',
            'Translatable#Search Title'
        ]);

        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        const cache = context?.getSearchCache();

        // saved search?
        if (cache?.name) {
            this.state.name = cache.name;

            // own search?
            const searches = await SearchService.getInstance().getSearchesOfUser();
            const savedSearch = searches.find((s) => s.id === cache.id);
            if (savedSearch) {
                this.state.newSearch = false;
                this.loadedSearchId = cache.id;

                // own shared search
                if (savedSearch.userId) {
                    this.state.share = true;
                }
            }
        }
    }

    public nameChanged(event: any): void {
        if (this.titleTimeout) {
            clearTimeout(this.titleTimeout);
        }

        this.titleTimeout = setTimeout(() => {
            this.state.name = event?.target?.value !== '' ? event.target.value : null;
            this.validateTitle();
        }, 200);

    }

    public shareChanged(event: any): void {
        this.state.share = event.target.checked;
    }

    public newChanged(event: any): void {
        this.state.newSearch = event.target.checked;
    }

    public async keyPressed(event: any): Promise<void> {
        if (event.key === 'Enter') {
            this.closeOverlay(true);
        }
    }

    public async validateTitle(): Promise<void> {
        this.state.error = null;
        if (!this.state.name) {
            this.state.error = await TranslationService.translate('Translatable#Title is required!');
        }
    }

    public inputClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
    }

    public async closeOverlay(save: boolean = false): Promise<void> {
        if (save) {
            await this.validateTitle();
            if (!this.state.error) {
                const searches = await SearchService.getInstance().getSearchesOfUser();
                const savedSearch = searches.find((s) => s.name === this.state.name);

                // name is already in use
                if (savedSearch?.id) {
                    // new search or loaded search (with new name) => ask
                    if (!this.loadedSearchId || this.loadedSearchId !== savedSearch.id) {
                        await this.askForOverwrite(savedSearch.id);
                    }
                    // old = loaded (with old name)
                    else {
                        // as new, but loaded already uses (old) name => ask
                        if (this.state.newSearch) {
                            await this.askForOverwrite(savedSearch.id);
                        }
                        // as update => just overwrite
                        else {
                            await this.saveSearch(savedSearch.id);
                        }
                    }
                }
                // rename/overwrite (loaded) or create new search
                else {
                    await this.saveSearch(this.state.newSearch ? undefined : this.loadedSearchId);
                }
            }
        } else {
            (this as any).emit('closeOverlay');
        }
    }

    private async askForOverwrite(oldId: string): Promise<void> {
        const result = await this.openAskOverwriteModal(this.state.name);
        if (result) {
            this.loadedSearchId = oldId;
            this.saveSearch(oldId);
        }
    }

    public openAskOverwriteModal(searchName: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const modalArea = document.getElementById('kix-modal-area');
            if (modalArea) {
                const template = KIXModulesService.getComponentTemplate('search-overwrite-modal');
                const content = template?.default?.renderSync({
                    searchName,
                    askCallback: (result: boolean) => resolve(result)
                });
                content.appendTo(modalArea);

                const templateModal = new bootstrap.Modal('#search-overwrite-modal', {});
                templateModal?.show();

                const modalElement = document.getElementById('search-overwrite-modal');
                modalElement.addEventListener('hidden.bs.modal', (event) => {
                    modalElement?.remove();
                });
            }
        });
    }

    private async saveSearch(id?: string): Promise<void> {
        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        await context?.saveCache(id, this.state.name, this.state.share);
        BrowserUtil.openSuccessOverlay('Translatable#Search successfully saved.');

        EventService.getInstance().publish(ContextEvents.CONTEXT_DISPLAY_TEXT_CHANGED, context);

        (this as any).emit('closeOverlay');
    }

}

module.exports = Component;
