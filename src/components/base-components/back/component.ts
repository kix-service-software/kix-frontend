import { KIXRouterStore } from "@kix/core/dist/browser/router/KIXRouterStore";

class BackComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    private navigateBack(): void {
        KIXRouterStore.getInstance().navigateBack('base-router');
    }

}

module.exports = BackComponent;
