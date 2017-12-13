import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';

export class RouterOutletComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            componentId: null,
            template: "",
            routerId: null,
            data: null
        };
    }

    public onInput(input: any): void {
        this.state.routerId = input.id;
    }

    public onMount(): void {
        ComponentRouterStore.getInstance().addStateListener(this.routerStateChanged.bind(this));
    }

    private routerStateChanged(): void {
        const router = ComponentRouterStore.getInstance().getCurrentRouter(this.state.routerId);
        if (router) {
            this.state.componentId = router.componentId;
            this.state.data = router.data;
            this.state.template = ClientStorageHandler.getComponentTemplate(this.state.componentId);
            if (!this.state.template) {
                this.state.template = "";
            }
        }
    }

}

module.exports = RouterOutletComponent;
