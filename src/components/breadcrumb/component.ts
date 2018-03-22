import { ComponentRouterService } from "@kix/core/dist/browser/router";
import { ComponentRouterHistoryEntry } from '@kix/core/dist/model';
import { ClientStorageHandler } from "@kix/core/dist/browser/ClientStorageHandler";

class BreadcrumbComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            breadcrumbDetails: null
        };
    }

    public onMount(): void {
        ComponentRouterService.getInstance().addServiceListener(this.routerStateChanged.bind(this));
    }

    private routerStateChanged(): void {
        this.state.breadcrumbDetails = ComponentRouterService.getInstance().getBreadcrumbDetails();
    }

}

module.exports = BreadcrumbComponent;
