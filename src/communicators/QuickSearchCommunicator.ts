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
import { CommunicatorResponse } from '@kix/core/dist/common';

export class QuickSearchCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'quick-search';
    }

    protected registerEvents(): void {
        this.registerEventHandler(QuickSearchEvent.EXECUTE_QUICK_SEARCH, this.executeQuickSearch.bind(this));
        this.registerEventHandler(QuickSearchEvent.LOAD_QUICK_SEARCHES, this.loadQuickSearches.bind(this));
    }

    private async executeQuickSearch(data: QuickSearchRequest): Promise<CommunicatorResponse> {
        const quickSearch = await this.pluginService.getQuickSearchExtension(data.quickSearchId);

        const result = await quickSearch.execute(data.token, data.searchValue);
        const response = new QuickSearchResponse(result);
        return new CommunicatorResponse(QuickSearchEvent.QUICK_SEARCH_FINISHED, response);
    }

    private async loadQuickSearches(data: LoadQuickSearchesRequest): Promise<CommunicatorResponse> {
        const quickSearches = await this.pluginService.getQuickSearches();
        return new CommunicatorResponse(
            QuickSearchEvent.LOAD_QUICK_SEARCHES_FINISHED,
            new LoadQuickSearchesResponse(quickSearches));
    }
}
