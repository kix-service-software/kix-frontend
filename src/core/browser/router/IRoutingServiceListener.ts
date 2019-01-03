import { ComponentRouter } from "../../model";

export interface IRoutingServiceListener {

    routedTo(router: ComponentRouter): void;

}
