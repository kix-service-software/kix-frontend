import { ComponentRouterStore } from "@kix/core/dist/browser/router/ComponentRouterStore";
import { ComponentRouterHistoryEntry } from '@kix/core/dist/browser/router/ComponentRouterHistoryEntry';
import { ClientStorageHandler } from "@kix/core/dist/browser/ClientStorageHandler";

class BreadcrumbComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            breadcrumbDetails: null
        };
    }

    public onMount(): void {
        ComponentRouterStore.getInstance().addStateListener(this.routerStateChanged.bind(this));
    }

    private routerStateChanged(): void {
        this.state.breadcrumbDetails = ComponentRouterStore.getInstance().getBreadcrumbDetails();
    }

    private navigate(event: any): void {
        if (event.preventDefault) {
            event.preventDefault();
        }
        ComponentRouterStore.getInstance().navigate('base-router', this.state.breadcrumbDetails.contextId, {}, true);
    }

}

module.exports = BreadcrumbComponent;
