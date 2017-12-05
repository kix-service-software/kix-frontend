import { KIXRouterStore } from "@kix/core/dist/browser/router/KIXRouterStore";
import { KIXRouterHistoryEntry } from '@kix/core/dist/browser/router/KIXRouterHistoryEntry';
import { ClientStorageHandler } from "../../../../../core/dist/browser/ClientStorageHandler";

class BreadcrumbComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            contextId: null
        };
    }

    public onMount(): void {
        KIXRouterStore.getInstance().addStateListener(this.routerStateChanged.bind(this));
    }

    private routerStateChanged(): void {
        this.state.contextId = ClientStorageHandler.getContextId();
        const history = KIXRouterStore.getInstance().getC
        this.state.history = history ? history : [];
        (this as any).setStateDirty('history');
    }

}

module.exports = BreadcrumbComponent;
