import { ICell } from "../../../../../../core/browser";
import { RoutingConfiguration, DialogRoutingConfiguration } from "../../../../../../core/browser/router";

export class ComponentState {

    public constructor(
        public routingConfiguration: RoutingConfiguration | DialogRoutingConfiguration = null,
        public object: any = null,
        public objectId: string | number = null,
        public showDefaultCell: boolean = true,
        public stateClasses: string[] = null
    ) { }

}
