import { ContextMode, KIXObjectType, KIXObject } from "@kix/core/dist/model";
import { RoutingConfiguration } from "@kix/core/dist/browser/router";

export class ComponentState {

    public constructor(
        public routingConfiguration: RoutingConfiguration = null,
        public objectId: string | number = null,
        public object: KIXObject = null,
        public url: string = null,
        public loading: boolean = false
    ) { }

}
