import { ILabelProvider } from "../../../core/browser";
import { KIXObject } from "../../../core/model";
import { RoutingConfiguration } from "../../../core/browser/router";

export class ComponentState {

    public constructor(
        public object: KIXObject = null,
        public flat: boolean = false,
        public properties: string[] = [],
        public labelProvider: ILabelProvider<KIXObject> = null,
    ) { }

}
