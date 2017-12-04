import { KIXRouterStore } from "@kix/core/dist/browser/router/KIXRouterStore";

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
        const history: Array<[string, any]> = KIXRouterStore.getInstance().getCurrentRouterHistory('base-router');
        this.state.history = history ? history : [];
        (this as any).setStateDirty('history');
    }

}

module.exports = BreadcrumbComponent;
