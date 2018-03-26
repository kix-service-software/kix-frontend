import { ComponentRouterService } from '@kix/core/dist/browser/router';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { RouterComponentState } from './RouterComponentState';
import { ComponentsService } from '@kix/core/dist/browser/components';

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
            this.state.template = ComponentsService.getInstance().getComponentTemplate(this.state.componentId);
            setTimeout(() => {
                (this as any).setStateDirty('template');
            }, 50);
        }
    }

}

module.exports = RouterOutletComponent;
