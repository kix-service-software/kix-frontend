/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { BrowserCacheService } from '../../modules/base-components/webapp/core/CacheService';
import { SearchCache } from '../../modules/search/model/SearchCache';
import { APIClient } from '../APIClient';

export class SearchAPIClient extends APIClient {

    public static async loadAllSearches(): Promise<SearchCache[]> {
        const searches = await this.loadSearches().catch(() => []) || [];
        const sharedSearches = await this.loadSharedSearches().catch(() => []) || [];
        return [...searches, ...sharedSearches];
    }

    public static async loadSearches(): Promise<SearchCache[]> {
        const response = await this.executeRequest(RequestMethod.GET, '/search');
        const result = await response.json();
        return result.search.map((s) => SearchCache.create(s));
    }

    public static async loadSharedSearches(): Promise<SearchCache[]> {
        const response = await this.executeRequest(RequestMethod.GET, '/search/shared');
        const result = await response.json();
        return result.search.map((s) => SearchCache.create(s));
    }

    public static async saveSearch(search: SearchCache, share?: boolean): Promise<void> {
        await this.executeRequest(RequestMethod.POST, '/search', { search, share });
        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
    }

    public static async saveSearchAsDefault(search: SearchCache): Promise<void> {
        const defaultSearch = SearchCache.create(search, true);
        await this.executeRequest(RequestMethod.POST, '/search/default', { search: defaultSearch });
        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
    }

    public static async loadDefaultUserSearch(objectType: KIXObjectType | string): Promise<SearchCache> {
        const response = await this.executeRequest(RequestMethod.GET, `/search/default/${objectType}`);
        const result = await response.json();
        return result.search;
    }

    public static async deleteSearch(id: string): Promise<void> {
        await this.executeRequest(RequestMethod.DELETE, `/search/${id}`);
    }

    public static async deleteUserDefaultSearch(objectType: string): Promise<void> {
        await this.executeRequest(RequestMethod.DELETE, `/search/default/${objectType}`);
    }

}