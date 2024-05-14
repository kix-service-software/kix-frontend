/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from '../../../server/socket-namespaces/SocketNameSpace';
import { SearchEvent } from '../model/SearchEvent';
import { SaveSearchRequest } from '../model/SaveSearchRequest';
import { SocketResponse } from '../../../modules/base-components/webapp/core/SocketResponse';
import { UserService } from '../../user/server/UserService';
import { User } from '../../user/model/User';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { SocketEvent } from '../../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../../modules/base-components/webapp/core/SocketErrorResponse';
import { ISocketRequest } from '../../../modules/base-components/webapp/core/ISocketRequest';
import { LoadSearchResponse } from '../model/LoadSearchResponse';
import { DeleteSearchRequest } from '../model/DeleteSearchRequest';
import { ISocketResponse } from '../../../modules/base-components/webapp/core/ISocketResponse';

import * as cookie from 'cookie';
import { IdService } from '../../../model/IdService';
import { SearchCache } from '../model/SearchCache';
import { Socket } from 'socket.io';
import { LoadSearchDefaultRequest } from '../model/LoadSearchDefaultRequest';
import { LoadSearchDefaultResponse } from '../model/LoadSearchDefaultResponse';
import { ClientNotificationService } from '../../../server/services/ClientNotificationService';
import { BackendNotification } from '../../../model/BackendNotification';
import { ObjectUpdatedEvent } from '../../../model/ObjectUpdatedEvent';

export class SearchNamespace extends SocketNameSpace {

    private static INSTANCE: SearchNamespace;

    public static getInstance(): SearchNamespace {
        if (!SearchNamespace.INSTANCE) {
            SearchNamespace.INSTANCE = new SearchNamespace();
        }
        return SearchNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'search';
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, SearchEvent.SAVE_SEARCH, this.saveSearch.bind(this));
        this.registerEventHandler(
            client, SearchEvent.SAVE_SEARCH_AS_DEFAULT, this.saveSearchAsDefault.bind(this)
        );
        this.registerEventHandler(
            client, SearchEvent.DELETE_SEARCH_DEFAULT, this.deleteUserSearchDefault.bind(this)
        );
        this.registerEventHandler(
            client, SearchEvent.LOAD_SEARCH_DEFAULT, this.loadSearchDefault.bind(this)
        );
        this.registerEventHandler(client, SearchEvent.LOAD_SEARCH, this.loadSearch.bind(this));
        this.registerEventHandler(client, SearchEvent.LOAD_SHARED_SEARCHES, this.loadSharedSearch.bind(this));
        this.registerEventHandler(client, SearchEvent.DELETE_SEARCH, this.deleteSearch.bind(this));
    }

    private async saveSearch(data: SaveSearchRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        if (data.search) {
            await this.saveUserSearch(data.search, data.share, token);
            return new SocketResponse(SearchEvent.SAVE_SEARCH_FINISHED, { requestId: data.requestId });
        } else {
            return new SocketResponse(
                SocketEvent.ERROR, new SocketErrorResponse(data.requestId, 'No user or search available.')
            );
        }
    }

    private async saveSearchAsDefault(data: SaveSearchRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        if (data.search) {
            const user = await UserService.getInstance().getUserByToken(token);
            this.saveUserSearchAsDefault(data.search, user);
            return new SocketResponse(SearchEvent.SAVE_SEARCH_AS_DEFAULT_FINISHED, { requestId: data.requestId });
        } else {
            return new SocketResponse(
                SocketEvent.ERROR, new SocketErrorResponse(data.requestId, 'No user or search available.')
            );
        }
    }

    private saveUserSearchAsDefault(search: SearchCache, user: User): void {
        const fileName = `${user.UserID}_default_search.json`;
        const defaultSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(
            fileName, []
        ) || [];

        const searchIndex = defaultSearches.findIndex((ss) => ss.objectType === search.objectType);
        if (searchIndex !== -1) {
            defaultSearches.splice(searchIndex, 1);
        }

        delete search.result;
        delete search['originalCriteria'];

        defaultSearches.push(search);
        ConfigurationService.getInstance().saveDataFileContent(fileName, defaultSearches);
    }

    private async deleteUserSearchDefault(data: DeleteSearchRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        if (data.id) {
            const user = await UserService.getInstance().getUserByToken(token);
            this.deleteDefault(data.id, user);
            return new SocketResponse(SearchEvent.DELETE_SEARCH_DEFAULT_FINISHED, { requestId: data.requestId });
        } else {
            return new SocketResponse(
                SocketEvent.ERROR, new SocketErrorResponse(data.requestId, 'No user or search available.')
            );
        }
    }

    private deleteDefault(objectType: string, user: User): void {
        const fileName = `${user.UserID}_default_search.json`;
        const defaultSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(
            fileName, []
        ) || [];

        const searchIndex = defaultSearches.findIndex((ss) => ss.objectType === objectType);
        if (searchIndex !== -1) {
            defaultSearches.splice(searchIndex, 1);
        }

        ConfigurationService.getInstance().saveDataFileContent(fileName, defaultSearches);
    }

    private async loadSearchDefault(data: LoadSearchDefaultRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        const user = await UserService.getInstance().getUserByToken(token);
        const defaultSearch = this.loadUserSearchDefault(data.objectType, user);
        return new SocketResponse(
            SearchEvent.SEARCH_DEFAULT_LOADED, new LoadSearchDefaultResponse(data.requestId, defaultSearch)
        );
    }

    private loadUserSearchDefault(objectType: string, user: User): SearchCache {
        const fileName = `${user.UserID}_default_search.json`;
        const defaultSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(
            fileName, []
        ) || [];

        return defaultSearches.find((ds) => ds.objectType === objectType);
    }

    private async saveUserSearch(search: SearchCache, share: boolean, token: string): Promise<void> {
        const user = await UserService.getInstance().getUserByToken(token)
            .catch((): User => null);

        if (!search.id) {
            search.id = IdService.generateDateBasedId('SearchCache');
        }

        delete search['originalCriteria'];

        if (share) {
            this.shareSearchCache(search, user);
        } else {
            this.deleteSharedSearch(search.id);
            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            const preferenceId = serverConfig.NOTIFICATION_CLIENT_ID + 'searchprofiles';

            const searchPreference = user.Preferences.find((p) => p.ID === preferenceId);
            let searchConfig = {};

            if (searchPreference) {
                searchConfig = JSON.parse(searchPreference.Value);
                delete searchConfig[search.id];
            }

            delete search.userId;
            delete search.userDisplayText;
            searchConfig[search.id] = search;

            const value = JSON.stringify(searchConfig);
            await UserService.getInstance().setPreferences(token, 'SearchNamespace', [[preferenceId, value]]);
        }

        const event = new BackendNotification();
        event.ObjectID = 'SharedSearch';
        event.Namespace = 'Search.Shared';
        event.Event = ObjectUpdatedEvent.UPDATE;
        ClientNotificationService.getInstance().queueNotifications([event]);
    }

    private shareSearchCache(search: SearchCache, user: User): void {
        const fileName = 'shared_searches.json';
        const sharedSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(
            fileName, []
        ) || [];

        const searchIndex = sharedSearches.findIndex((ss) => ss.id === search.id);
        if (searchIndex !== -1) {
            const existingSearch = sharedSearches[searchIndex];

            if (existingSearch?.userId !== user.UserID) {
                // do not overwrite a search from another user
                return;
            }

            sharedSearches.splice(searchIndex, 1);
        }

        search.userId = user.UserID;
        search.userDisplayText = user.UserLogin;
        sharedSearches.push(search);

        ConfigurationService.getInstance().saveDataFileContent(fileName, sharedSearches);
    }

    private async loadSearch(data: ISocketRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        const user = await UserService.getInstance().getUserByToken(token);
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const preferenceId = serverConfig.NOTIFICATION_CLIENT_ID + 'searchprofiles';

        const searchPreference = user?.Preferences?.find((p) => p.ID === preferenceId);

        const searchConfigs = [];
        if (searchPreference) {
            const search = JSON.parse(searchPreference.Value);
            const deleteSearches: string[] = [];
            for (const s in search) {
                if (search[s]) {
                    if (!search[s].id) {
                        search[s].id = IdService.generateDateBasedId('SearchCache');
                        deleteSearches.push(s);
                        await this.saveUserSearch(search[s], false, token);
                    }
                    searchConfigs.push(search[s]);
                }
            }

            for (const s of deleteSearches) {
                await this.deleteUserSearch(s, token);
            }
        }

        const response = new LoadSearchResponse(data.requestId, searchConfigs);
        return new SocketResponse(SearchEvent.SEARCH_LOADED, response);
    }

    private async loadSharedSearch(data: ISocketRequest, client: Socket): Promise<SocketResponse> {
        const response = new LoadSearchResponse(data.requestId, this.getSharedSearces());
        return new SocketResponse(SearchEvent.SHARED_SEARCHES_LOADED, response);
    }

    private getSharedSearces(): SearchCache[] {
        const fileName = 'shared_searches.json';
        const sharedSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(
            fileName, []
        ) || [];
        return sharedSearches;
    }

    private async deleteSearch(data: DeleteSearchRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        await this.deleteUserSearch(data.id, token);
        this.deleteSharedSearch(data.id);

        const response: ISocketResponse = { requestId: data.requestId };
        return new SocketResponse(SearchEvent.SEARCH_DELETED, response);
    }

    private async deleteUserSearch(id: string, token: string): Promise<void> {
        const user = await UserService.getInstance().getUserByToken(token);
        if (user) {
            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            const preferenceId = serverConfig.NOTIFICATION_CLIENT_ID + 'searchprofiles';

            const searchPreference = user.Preferences.find((p) => p.ID === preferenceId);

            if (searchPreference) {
                const search = JSON.parse(searchPreference.Value);
                if (id && search[id]) {
                    delete search[id];
                    const value = JSON.stringify(search);
                    await UserService.getInstance().setPreferences(token, 'SearchNamespace', [[preferenceId, value]]);
                }
            }
        }
    }

    private deleteSharedSearch(id: string): void {
        const fileName = 'shared_searches.json';
        const sharedSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(
            fileName, []
        ) || [];

        const searchIndex = sharedSearches.findIndex((ss) => ss.id === id);
        if (searchIndex !== -1) {
            sharedSearches.splice(searchIndex, 1);
        }

        ConfigurationService.getInstance().saveDataFileContent(fileName, sharedSearches);
    }
}
