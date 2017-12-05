import { KIXRouterStore } from '@kix/core/dist/browser/router/KIXRouterStore';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { KIXRouter } from '@kix/core/dist/routes/KIXRouter';

export class RouterOutletComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            componentId: null,
            template: null,
            routerId: null,
            data: null
        };
    }

    public onInput(input: any): void {
        this.state.routerId = input.id;
    }

    public onMount(): void {
        KIXRouterStore.getInstance().addStateListener(this.routerStateChanged.bind(this));
    }

    private routerStateChanged(): void {
        const componentId = KIXRouterStore.getInstance().getCurrentComponent(this.state.routerId);
        this.state.componentId = componentId;

        const data = KIXRouterStore.getInstance().getCurrentComponentData(this.state.routerId);
        this.state.data = data;

        const tag = ClientStorageHandler.getComponentTemplate(componentId);
        if (tag) {
            const template = require(tag);
            this.state.template = template;
        } else {
            this.state.template = null;
        }
    }

}

module.exports = RouterOutletComponent;
