import { ISocketRequest } from "../ISocketRequest";
import { KIXObjectType } from "../../kix";

export interface ISocketObjectRequest extends ISocketRequest {

    objectType: KIXObjectType;

}
