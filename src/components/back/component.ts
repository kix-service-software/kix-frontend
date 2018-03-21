import { ComponentRouterService } from "@kix/core/dist/browser/router";

class BackComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    private navigateBack(): void {
        ComponentRouterService.getInstance().navigateBack('base-router');
    }

}

module.exports = BackComponent;
