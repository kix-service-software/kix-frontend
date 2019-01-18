import { IService } from "../../common";

export interface IServiceRegistryExtension {

    getServices(): Map<string, any>;

}
