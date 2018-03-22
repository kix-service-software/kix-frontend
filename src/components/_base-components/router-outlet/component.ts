import { ComponentRouterService } from '@kix/core/dist/browser/router';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { RouterComponentState } from './RouterComponentState';

export class RouterOutletComponent {

    private state: RouterComponentState;

    public onCreate(input: any): void {
        this.state = new RouterComponentState();
    }

    public onInput(input: any): void {
        this.state.routerId = input.id;
    }

    public onMount(): void {
        ComponentRouterService.getInstance().addServiceListener(this.routerStateChanged.bind(this));
        this.routerStateChanged();
    }

    private routerStateChanged(): void {
        const router = ComponentRouterService.getInstance().getCurrentRouter(this.state.routerId);
        if (router) {
            this.state.componentId = router.componentId;
            this.state.data = router.data;
            this.state.template = ClientStorageHandler.getComponentTemplate(this.state.componentId);
            (this as any).setStateDirty('template');
        }
    }

}

module.exports = RouterOutletComponent;
