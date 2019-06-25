import { KIXObjectType } from "../../model";
import { ServiceType } from "./ServiceType";

export interface IKIXService {

    hasReadPermissionFor(linkableObjectType: KIXObjectType): Promise<boolean>;

    isServiceFor(kixObjectType: KIXObjectType): boolean;

    isServiceType(kixObjectServiceType: ServiceType): boolean;

}
