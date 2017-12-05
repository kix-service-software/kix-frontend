import { KIXRouterStore } from "@kix/core/dist/browser/router/KIXRouterStore";
import { KIXRouterHistoryEntry } from '@kix/core/dist/browser/router/KIXRouterHistoryEntry';
import { ClientStorageHandler } from "../../../../../core/dist/browser/ClientStorageHandler";

class BreadcrumbComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            contextId: null,
            parameter: null
        };
    }

    public onMount(): void {
        KIXRouterStore.getInstance().addStateListener(this.routerStateChanged.bind(this));
    }

    private routerStateChanged(): void {
        this.state.contextId = ClientStorageHandler.getContextId();
        this.state.parameter = KIXRouterStore.getInstance().getCurrentParameterValue('base-router');
        (this as any).setStateDirty('parameter');
    }

    private navigate(event: any): void {
        if (event.preventDefault) {
            event.preventDefault();
        }
        KIXRouterStore.getInstance().navigate('base-router', this.state.contextId, {}, true);
    }

    private navigateParameter(event: any): void {
        if (event.preventDefault) {
            event.preventDefault();
        }
        KIXRouterStore.getInstance().navigate('base-router', this.state.contextId, {}, true, this.state.parameter);
    }

}

module.exports = BreadcrumbComponent;
