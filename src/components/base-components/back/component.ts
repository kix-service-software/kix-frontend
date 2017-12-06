import { ComponentRouterStore } from "@kix/core/dist/browser/router/ComponentRouterStore";

class BackComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    private navigateBack(): void {
        ComponentRouterStore.getInstance().navigateBack('base-router');
    }

}

module.exports = BackComponent;
