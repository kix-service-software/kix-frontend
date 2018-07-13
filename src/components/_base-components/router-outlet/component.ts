import { RouterComponentState } from './RouterComponentState';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { RoutingService, IRoutingServiceListener } from '@kix/core/dist/browser/router';
import { ComponentRouter } from '@kix/core/dist/model';

export class RouterOutletComponent implements IRoutingServiceListener {

    private state: RouterComponentState;

    public onCreate(input: any): void {
        this.state = new RouterComponentState();
    }

    public onInput(input: any): void {
        this.state.routerId = input.id;
    }

    public onMount(): void {
        RoutingService.getInstance().registerServiceListener(this);
    }

    public routedTo(router: ComponentRouter): void {
        if (router) {
            this.state.componentId = router.componentId;
            this.state.data = router.data;
            this.state.template = ComponentsService.getInstance().getComponentTemplate(this.state.componentId);
            (this as any).update();
        }
    }

}

module.exports = RouterOutletComponent;
