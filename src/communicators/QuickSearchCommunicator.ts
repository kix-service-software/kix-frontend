import { KIXCommunicator } from './KIXCommunicator';
import {
    SocketEvent,
    LoadQuickSearchesResponse,
    LoadQuickSearchesRequest,
    QuickSearchEvent,
    QuickSearchRequest,
    QuickSearchResponse
} from '@kix/core/dist/model';
import { IQuickSearchExtension } from '@kix/core/dist/extensions';

export class QuickSearchCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/quick-search');
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerEvents(client);
        });
    }

    private registerEvents(client: SocketIO.Socket): void {
        client.on(QuickSearchEvent.EXECUTE_QUICK_SEARCH, async (data: QuickSearchRequest) => {
            const quickSearch = await this.pluginService.getQuickSearchExtension(data.quickSearchId);

            const result = await quickSearch.execute(data.token, data.searchValue);
            const response = new QuickSearchResponse(result);
            client.emit(QuickSearchEvent.QUICK_SEARCH_FINISHED, response);
        });

        client.on(QuickSearchEvent.LOAD_QUICK_SEARCHES, async (data: LoadQuickSearchesRequest) => {
            const quickSearches = await this.pluginService.getQuickSearches();
            client.emit(QuickSearchEvent.LOAD_QUICK_SEARCHES_FINISHED, new LoadQuickSearchesResponse(quickSearches));
        });
    }

}
