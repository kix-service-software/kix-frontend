import { KIXRouterStore } from "@kix/core/dist/browser/router/KIXRouterStore";
import { KIXRouterHistoryEntry } from '@kix/core/dist/browser/router/KIXRouterHistoryEntry';
import { ClientStorageHandler } from "@kix/core/dist/browser/ClientStorageHandler";

class BreadcrumbComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            breadcrumbDetails: null
        };
    }

    public onMount(): void {
        KIXRouterStore.getInstance().addStateListener(this.routerStateChanged.bind(this));
    }

    private routerStateChanged(): void {
        this.state.breadcrumbDetails = KIXRouterStore.getInstance().getBreadcrumbDetails();
    }

    private navigate(event: any): void {
        if (event.preventDefault) {
            event.preventDefault();
        }
        KIXRouterStore.getInstance().navigate('base-router', this.state.breadcrumbDetails.contextId, {}, true);
    }

}

module.exports = BreadcrumbComponent;
