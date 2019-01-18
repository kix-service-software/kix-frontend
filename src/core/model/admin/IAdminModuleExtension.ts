import { AdminModuleCategory } from "./AdminModuleCategory";

export interface IAdminModuleExtension {

    getAdminModules(): AdminModuleCategory[];

}
