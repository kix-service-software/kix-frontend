import { RouterComponentState } from './RouterComponentState';
import { RoutingService, IRoutingServiceListener } from '../../../core/browser/router';
import { ComponentRouter } from '../../../core/model';
import { KIXModulesService } from '../../../core/browser/modules';

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
            this.state.template = KIXModulesService.getComponentTemplate(this.state.componentId);
            (this as any).update();
        }
    }

}

module.exports = RouterOutletComponent;
