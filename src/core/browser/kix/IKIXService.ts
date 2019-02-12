import { KIXObjectType } from "../../model";
import { ServiceType } from "./ServiceType";

export interface IKIXService {

    isServiceFor(kixObjectType: KIXObjectType): boolean;

    isServiceType(kixObjectServiceType: ServiceType): boolean;

}
