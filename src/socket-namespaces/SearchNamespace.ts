/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from './SocketNameSpace';
import { SocketResponse, SocketErrorResponse } from '../core/common';
import { UserService } from '../core/services/impl/api/UserService';
import { SearchEvent, SaveSearchRequest, LoadSearchResponse, DeleteSearchRequest } from '../core/model/socket/search';
import { ConfigurationService } from '../core/services';
import { SocketEvent, ISocketRequest, ISocketResponse } from '../core/model';

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

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, SearchEvent.SAVE_SEARCH, this.saveSearch.bind(this));
        this.registerEventHandler(client, SearchEvent.LOAD_SEARCH, this.loadSearch.bind(this));
        this.registerEventHandler(client, SearchEvent.DELETE_SEARCH, this.deleteSearch.bind(this));
    }

    private async saveSearch(data: SaveSearchRequest): Promise<SocketResponse> {
        let userId = null;
        if (data.token) {
            const user = await UserService.getInstance().getUserByToken(data.token)
                .catch(() => null);
            userId = user ? user.UserID : null;
        }

        if (userId && data.search) {
            let searchConfig = ConfigurationService.getInstance().getConfiguration('search', userId);
            if (!searchConfig) {
                searchConfig = {};
            }

            if (data.existingName !== null && data.existingName !== data.search.name) {
                delete searchConfig[data.existingName];
            }
            searchConfig[data.search.name] = data.search;

            const response = await ConfigurationService.getInstance().saveConfiguration('search', searchConfig, userId)
                .then(() => new SocketResponse(SearchEvent.SAVE_SEARCH_FINISHED, { requestId: data.requestId }))
                .catch((error) =>
                    new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error))
                );

            return response;
        } else {
            return new SocketResponse(
                SocketEvent.ERROR, new SocketErrorResponse(data.requestId, 'No user or search available.')
            );
        }
    }

    private async loadSearch(data: ISocketRequest): Promise<SocketResponse> {
        let userId = null;
        if (data.token) {
            const user = await UserService.getInstance().getUserByToken(data.token);
            userId = user.UserID;
        }

        const search = await ConfigurationService.getInstance().getConfiguration('search', userId);

        const searchConfigs = [];
        for (const s in search) {
            if (search[s]) {
                searchConfigs.push(search[s]);
            }
        }

        const response = new LoadSearchResponse(data.requestId, searchConfigs);
        return new SocketResponse(SearchEvent.SEARCH_LOADED, response);
    }

    private async deleteSearch(data: DeleteSearchRequest): Promise<SocketResponse> {
        let userId = null;
        if (data.token) {
            const user = await UserService.getInstance().getUserByToken(data.token);
            userId = user.UserID;
        }

        const search = await ConfigurationService.getInstance().getConfiguration('search', userId);

        if (data.name && search[data.name]) {
            delete search[data.name];
            await ConfigurationService.getInstance().saveConfiguration('search', search, userId);
        }

        const response: ISocketResponse = { requestId: data.requestId };
        return new SocketResponse(SearchEvent.SEARCH_DELETED, response);
    }
}
