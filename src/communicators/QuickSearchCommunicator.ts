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

    private client: SocketIO.Socket;

    public getNamespace(): string {
        return 'quick-search';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.client = client;
        client.on(QuickSearchEvent.EXECUTE_QUICK_SEARCH, this.executeQuickSearch.bind(this));
        client.on(QuickSearchEvent.LOAD_QUICK_SEARCHES, this.loadQuickSearches.bind(this));
    }

    private async executeQuickSearch(data: QuickSearchRequest): Promise<void> {
        const quickSearch = await this.pluginService.getQuickSearchExtension(data.quickSearchId);

        const result = await quickSearch.execute(data.token, data.searchValue);
        const response = new QuickSearchResponse(result);
        this.client.emit(QuickSearchEvent.QUICK_SEARCH_FINISHED, response);
    }

    private async loadQuickSearches(data: LoadQuickSearchesRequest): Promise<void> {
        const quickSearches = await this.pluginService.getQuickSearches();
        this.client.emit(QuickSearchEvent.LOAD_QUICK_SEARCHES_FINISHED, new LoadQuickSearchesResponse(quickSearches));
    }
}
