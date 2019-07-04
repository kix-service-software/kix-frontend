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
        const initComponents = await PermissionService.getInstance().filterUIComponents(
            token, [...uiModule.initComponents]
        );

        const uiComponents = await PermissionService.getInstance().filterUIComponents(
            token, [...uiModule.uiComponents]
        );

        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        const prePath = '/@kix/frontend$' + version + '/dist/';
        const preComponentPath = '/@kix/frontend$' + version + '/dist/components/';

        initComponents.forEach((m) => m.componentPath = prePath + m.componentPath);
        uiComponents.forEach((m) => m.componentPath = preComponentPath + m.componentPath);

        return {
            id: uiModule.id,
            external: uiModule.external,
            initComponents,
            uiComponents
        };
    }

}
