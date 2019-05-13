import { IKIXModuleExtension } from "./IKIXModuleExtension";
import { PermissionService } from "../../../services";

export class KIXModuleFactory {

    private static INSTANCE: KIXModuleFactory;

    public static getInstance(): KIXModuleFactory {
        if (!KIXModuleFactory.INSTANCE) {
            KIXModuleFactory.INSTANCE = new KIXModuleFactory();
        }
        return KIXModuleFactory.INSTANCE;
    }

    private constructor() { }


    public async create(token: string, uiModule: IKIXModuleExtension): Promise<IKIXModuleExtension> {
        const uiComponents = await PermissionService.getInstance().filterUIComponents(
            token, [...uiModule.uiComponents]
        );

        const initComponents = await PermissionService.getInstance().filterUIComponents(
            token, [...uiModule.initComponents]
        );

        return {
            id: uiModule.id,
            external: uiModule.external,
            initComponents,
            uiComponents
        };
    }

}
