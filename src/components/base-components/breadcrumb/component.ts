import { KIXRouterStore } from "@kix/core/dist/browser/router/KIXRouterStore";
import { KIXRouterHistoryEntry } from '@kix/core/dist/browser/router/KIXRouterHistoryEntry';

class BreadcrumbComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            history: []
        };
    }

    public onMount(): void {
        KIXRouterStore.getInstance().addStateListener(this.routerStateChanged.bind(this));
    }

    private routerStateChanged(): void {
        const history = KIXRouterStore.getInstance().getCurrentRouterHistory('base-router');
        this.state.history = history ? history : [];
        (this as any).setStateDirty('history');
    }

}

module.exports = BreadcrumbComponent;
