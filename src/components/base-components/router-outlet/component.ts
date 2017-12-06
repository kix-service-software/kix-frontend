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
        const tagLib = ClientStorageHandler.getTagLib();

        const router = KIXRouterStore.getInstance().getCurrentRouter(this.state.routerId);
        if (router) {
            this.state.componentId = router.componentId;
            this.state.data = router.data;

            const tag = tagLib.find((t) => t[0] === router.componentId);
            if (tag) {
                const template = require(tag[1]);
                this.state.template = template;
            } else {
                this.state.template = null;
            }
        }
    }

}

module.exports = RouterOutletComponent;
