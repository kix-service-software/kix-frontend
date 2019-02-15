import { ICell } from "../../../../../../core/browser";
import { RoutingConfiguration } from "../../../../../../core/browser/router";

export class ComponentState {

    public constructor(
        public cell: ICell = null,
        public routingConfiguration: RoutingConfiguration = null,
        public object: any = null,
        public objectId: string | number = null,
        public showDefaultCell: boolean = true,
        public stateClass: string = null
    ) { }

}
