/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SearchService } from './SearchService';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { Context } from '../../../../model/Context';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { SearchCache } from '../../model/SearchCache';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { IdService } from '../../../../model/IdService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { SearchSocketClient } from '.';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { SearchEvent } from '../../model/SearchEvent';
import { KIXObject } from '../../../../model/kix/KIXObject';

export abstract class SearchContext extends Context {

    protected searchCache: SearchCache;

    public getSearchCache(): SearchCache {
        return this.searchCache;
    }

    public async initContext(urlParams: URLSearchParams): Promise<void> {
        if (urlParams) {
            if (urlParams.has('search')) {
                try {
                    const cache = JSON.parse(decodeURIComponent(urlParams.get('search')));
                    this.searchCache = SearchCache.create(cache);
                    this.setSearchCache(this.searchCache);
                    await SearchService.getInstance().executeSearchCache(null, null, this.searchCache, this);
                } catch (error) {
                    console.error(error);
                    this.searchCache = new SearchCache(
                        IdService.generateDateBasedId(), this.descriptor.contextId, this.descriptor.kixObjectTypes[0],
                        [], [], null
                    );
                }
            }
        } else {
            this.searchCache = new SearchCache(
                IdService.generateDateBasedId(), this.descriptor.contextId, this.descriptor.kixObjectTypes[0],
                [], [], null
            );
        }
    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = this.descriptor.urlPaths[0];
            const params = [];
            if (this.searchCache) {
                const cache = JSON.stringify({ ...this.searchCache, result: [] });
                params.push(`search=${encodeURIComponent(cache)}`);
            }

            if (params.length) {
                url += `?${params.join('&')}`;
            }
        }
        return url;
    }

    public setSearchCache(cache: SearchCache): void {
        this.searchCache = cache;
        EventService.getInstance().publish(SearchEvent.SEARCH_CACHE_CHANGED, this);
        ContextService.getInstance().setDocumentHistory(true, this, this, null);
    }

    public getIcon(): string | ObjectIcon {
        return 'kix-icon-search';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        let text = await TranslationService.translate('Translatable#Search');
        if (this.searchCache) {
            let searchName = this.searchCache.name;
            if (!searchName) {
                searchName = await LabelService.getInstance().getObjectName(this.searchCache.objectType, true);
            }
            text = await TranslationService.translate('Translatable#Search: {0}', [searchName]);
        }

        const title = await TranslationService.translate(text);
        return title;
    }

    public async saveCache(name: string): Promise<void> {
        if (this.searchCache) {
            const search = SearchCache.create(this.searchCache);
            search.name = name;

            await SearchSocketClient.getInstance().saveSearch(search)
                .catch((error: Error) => BrowserUtil.openErrorOverlay(error.message));

            this.searchCache.name = name;
            await SearchService.getInstance().getSearchBookmarks(true);
            EventService.getInstance().publish(SearchEvent.SAVE_SEARCH_FINISHED);
        }
    }

    public async deleteSearch(): Promise<void> {
        if (this.searchCache && this.searchCache.name !== null) {
            await SearchSocketClient.getInstance().deleteSearch(this.searchCache.id);
            await SearchService.getInstance().getSearchBookmarks(true);
            this.resetSearch();
        }
    }

    public async setSearchResult(objects: KIXObject[]): Promise<void> {
        this.searchCache.result = objects;
        this.setObjectList(this.searchCache.objectType, objects);
    }

    public resetSearch(): void {
        this.searchCache.reset();
        EventService.getInstance().publish(SearchEvent.SEARCH_DELETED, this);
        ContextService.getInstance().setDocumentHistory(true, this, this, null);
    }

}
