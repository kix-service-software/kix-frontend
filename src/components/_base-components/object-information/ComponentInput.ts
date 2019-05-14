import { KIXObject } from "../../../core/model";
import { RoutingConfiguration } from "../../../core/browser/router";

export class ComponentInput {

    public object: KIXObject;

    public properties: string[];

    public flat: boolean;

    public routingConfiguration: RoutingConfiguration;

    public navigationProperties: string[];

}
