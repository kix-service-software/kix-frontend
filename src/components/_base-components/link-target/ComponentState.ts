import { ContextMode, KIXObjectType, KIXObject } from '../../../core/model';
import { RoutingConfiguration } from '../../../core/browser/router';

export class ComponentState {

    public constructor(
        public routingConfiguration: RoutingConfiguration = null,
        public objectId: string | number = null,
        public object: KIXObject = null,
        public url: string = null,
        public loading: boolean = false
    ) { }

}
