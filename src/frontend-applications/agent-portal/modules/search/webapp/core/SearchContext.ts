/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { CacheState } from '../../model/CacheState';

export class SearchContext extends Context {

    public static CONTEXT_ID = 'search';

    private searchCache: SearchCache;

    public async initContext(urlParams: URLSearchParams): Promise<void> {
        if (urlParams) {
            if (urlParams.has('search')) {
                try {
                    const cache = JSON.parse(urlParams.get('search'));
                    this.setSearchCache(cache);
                    await SearchService.getInstance().executeSearchCache(null, null, cache);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = this.descriptor.urlPaths[0];
            const params = [];
            if (this.searchCache && this.searchCache.status === CacheState.VALID) {
                const cache = JSON.stringify({ ...this.searchCache, result: [] });
                params.push(`search=${cache}`);
            }

            if (params.length) {
                url += `?${params.join('&')}`;
            }
        }
        return url;
    }

    public setSearchCache(cache: SearchCache): void {
        this.searchCache = cache;
        ContextService.getInstance().setDocumentHistory(true, this, this, null);
    }

    public getIcon(): string | ObjectIcon {
        return 'kix-icon-search';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        const title = await TranslationService.translate('Translatable#Results advanced search');
        return title;
    }

}
