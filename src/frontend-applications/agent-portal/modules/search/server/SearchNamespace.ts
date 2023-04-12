/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
        this.registerEventHandler(client, SearchEvent.LOAD_SEARCH, this.loadSearch.bind(this));
        this.registerEventHandler(client, SearchEvent.DELETE_SEARCH, this.deleteSearch.bind(this));
    }

    private async saveSearch(data: SaveSearchRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        if (data.search) {
            await this.saveUserSearch(data.search, token);
            return new SocketResponse(SearchEvent.SAVE_SEARCH_FINISHED, { requestId: data.requestId });
        } else {
            return new SocketResponse(
                SocketEvent.ERROR, new SocketErrorResponse(data.requestId, 'No user or search available.')
            );
        }
    }

    private async saveUserSearch(search: SearchCache, token: string): Promise<void> {
        const user = await UserService.getInstance().getUserByToken(token)
            .catch((): User => null);

        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const preferenceId = serverConfig.NOTIFICATION_CLIENT_ID + 'searchprofiles';

        const searchPreference = user.Preferences.find((p) => p.ID === preferenceId);
        let searchConfig = {};

        if (searchPreference) {
            searchConfig = JSON.parse(searchPreference.Value);
            delete searchConfig[search.id];
        }
        if (!search.id) {
            search.id = IdService.generateDateBasedId('SearchCache');
        }
        searchConfig[search.id] = search;

        const value = JSON.stringify(searchConfig);
        await UserService.getInstance().setPreferences(token, 'SearchNamespace', [[preferenceId, value]]);
    }

    private async loadSearch(data: ISocketRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        const user = await UserService.getInstance().getUserByToken(token);
        if (user) {
            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            const preferenceId = serverConfig.NOTIFICATION_CLIENT_ID + 'searchprofiles';

            const searchPreference = user.Preferences.find((p) => p.ID === preferenceId);

            const searchConfigs = [];
            if (searchPreference) {
                const search = JSON.parse(searchPreference.Value);
                const deleteSearches: string[] = [];
                for (const s in search) {
                    if (search[s]) {
                        if (!search[s].id) {
                            search[s].id = IdService.generateDateBasedId('SearchCache');
                            deleteSearches.push(s);
                            await this.saveUserSearch(search[s], token);
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
    }

    private async deleteSearch(data: DeleteSearchRequest, client: Socket): Promise<SocketResponse> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        await this.deleteUserSearch(data.id, token);

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
}
