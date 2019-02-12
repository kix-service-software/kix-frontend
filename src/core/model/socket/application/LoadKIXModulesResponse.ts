import { IKIXModuleExtension } from "../../../extensions";

export class LoadKIXModulesResponse {

    public constructor(public requestId: string, public modules: IKIXModuleExtension[]) { }

}
