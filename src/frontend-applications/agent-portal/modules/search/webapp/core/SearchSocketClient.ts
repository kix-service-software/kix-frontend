/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from '../../../../modules/base-components/webapp/core/SocketClient';
import { SearchCache } from '../../model/SearchCache';
import { IdService } from '../../../../model/IdService';
import { ClientStorageService } from '../../../../modules/base-components/webapp/core/ClientStorageService';
import { SaveSearchRequest } from '../../model/SaveSearchRequest';
import { SearchEvent } from '../../model/SearchEvent';
import { ISocketResponse } from '../../../../modules/base-components/webapp/core/ISocketResponse';
import { SocketEvent } from '../../../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../../../modules/base-components/webapp/core/SocketErrorResponse';
import { LoadSearchResponse } from '../../model/LoadSearchResponse';
import { ISocketRequest } from '../../../../modules/base-components/webapp/core/ISocketRequest';
import { DeleteSearchRequest } from '../../model/DeleteSearchRequest';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { BrowserCacheService } from '../../../base-components/webapp/core/CacheService';
import { LoadSearchDefaultRequest } from '../../model/LoadSearchDefaultRequest';
import { LoadSearchDefaultResponse } from '../../model/LoadSearchDefaultResponse';

export class SearchSocketClient extends SocketClient {

    public static getInstance(): SearchSocketClient {
        if (!SearchSocketClient.INSTANCE) {
            SearchSocketClient.INSTANCE = new SearchSocketClient();
        }

        return SearchSocketClient.INSTANCE;
    }

    private static INSTANCE: SearchSocketClient = null;

    private constructor() {
        super('search');
    }

    public async saveSearch(search: SearchCache, share?: boolean): Promise<void> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();

            const request = new SaveSearchRequest(
                requestId, ClientStorageService.getClientRequestId(), search, share
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + SearchEvent.SAVE_SEARCH);
            }, socketTimeout);

            this.socket.on(SearchEvent.SAVE_SEARCH_FINISHED, (result: ISocketResponse) => {
                if (result.requestId === requestId) {
                    BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
                    window.clearTimeout(timeout);
                    resolve();
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(SearchEvent.SAVE_SEARCH, request);
        });
    }

    public async saveSearchAsDefault(search: SearchCache): Promise<void> {
        const defaultSearch = SearchCache.create(search, true);

        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();

            const request = new SaveSearchRequest(
                requestId, ClientStorageService.getClientRequestId(), defaultSearch
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + SearchEvent.SAVE_SEARCH_AS_DEFAULT);
            }, socketTimeout);

            this.socket.on(SearchEvent.SAVE_SEARCH_AS_DEFAULT_FINISHED, (result: ISocketResponse) => {
                if (result.requestId === requestId) {
                    BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
                    window.clearTimeout(timeout);
                    resolve();
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(SearchEvent.SAVE_SEARCH_AS_DEFAULT, request);
        });
    }

    public async loadDefaultUserSearch(objectType: KIXObjectType | string): Promise<SearchCache> {
        this.checkSocketConnection();

        return new Promise<SearchCache>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();

            const request = new LoadSearchDefaultRequest(
                requestId, objectType
            );

            this.socket.on(SearchEvent.SEARCH_DEFAULT_LOADED, (result: LoadSearchDefaultResponse) => {
                if (result.requestId === requestId) {
                    const search = result.search
                        ? SearchCache.create(result.search)
                        : null;
                    resolve(search);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(SearchEvent.LOAD_SEARCH_DEFAULT, request);
        });
    }

    public async loadAllSearches(): Promise<SearchCache[]> {
        const searches = await this.loadSearches().catch(() => []) || [];
        const sharedSearches = await this.loadSharedSearches().catch(() => []) || [];
        return [...searches, ...sharedSearches];
    }

    public async loadSearches(): Promise<SearchCache[]> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<SearchCache[]>((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + SearchEvent.LOAD_SEARCH);
            }, socketTimeout);

            const requestId = IdService.generateDateBasedId('search-');

            this.socket.on(SearchEvent.SEARCH_LOADED, (result: LoadSearchResponse) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    const searches: SearchCache[] = [];
                    if (Array.isArray(result.search)) {
                        result.search.forEach((s) => searches.push(SearchCache.create(s)));
                    }
                    resolve(searches);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request: ISocketRequest = {
                clientRequestId: ClientStorageService.getClientRequestId(),
                requestId
            };
            this.socket.emit(
                SearchEvent.LOAD_SEARCH, request
            );
        });
    }

    public async loadSharedSearches(): Promise<SearchCache[]> {
        this.checkSocketConnection();

        return new Promise<SearchCache[]>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId('search-');

            this.socket.on(SearchEvent.SHARED_SEARCHES_LOADED, (result: LoadSearchResponse) => {
                if (result.requestId === requestId) {
                    const searches: SearchCache[] = [];
                    if (Array.isArray(result.search)) {
                        result.search.forEach((s) => searches.push(SearchCache.create(s)));
                    }
                    resolve(searches);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request: ISocketRequest = {
                clientRequestId: ClientStorageService.getClientRequestId(),
                requestId
            };
            this.socket.emit(
                SearchEvent.LOAD_SHARED_SEARCHES, request
            );
        });
    }

    public async deleteSearch(id: string): Promise<void> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + SearchEvent.DELETE_SEARCH);
            }, socketTimeout);

            const requestId = IdService.generateDateBasedId('search-');

            this.socket.on(SearchEvent.SEARCH_DELETED, (result: ISocketResponse) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve();
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request = new DeleteSearchRequest(requestId, ClientStorageService.getClientRequestId(), id);
            this.socket.emit(SearchEvent.DELETE_SEARCH, request);
        });
    }

    public async deleteUserDefaultSearch(objectType: string): Promise<void> {
        this.checkSocketConnection();

        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId('search-');

            this.socket.on(SearchEvent.DELETE_SEARCH_DEFAULT_FINISHED, (result: ISocketResponse) => {
                if (result.requestId === requestId) {
                    resolve();
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request = new DeleteSearchRequest(requestId, ClientStorageService.getClientRequestId(), objectType);
            this.socket.emit(SearchEvent.DELETE_SEARCH_DEFAULT, request);
        });
    }

}
