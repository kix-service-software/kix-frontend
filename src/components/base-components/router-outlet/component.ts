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
        const router = KIXRouterStore.getInstance().getCurrentRouter(this.state.routerId);
        if (router) {
            this.state.componentId = router.componentId;
            this.state.data = router.data;

            const template = ClientStorageHandler.getComponentTemplate(this.state.componentId);
            if (template) {
                this.state.template = template;
            } else {
                this.state.template = null;
            }
        }
    }

}

module.exports = RouterOutletComponent;
