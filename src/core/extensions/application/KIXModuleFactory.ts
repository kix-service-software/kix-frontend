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
        const prePath = '/@kix/frontend$' + version + '/dist/components/';

        const tags = [];

        initComponents.forEach((m) => tags.push(prePath + m.componentPath));
        uiComponents.forEach((m) => tags.push(prePath + m.componentPath));

        return {
            id: uiModule.id,
            external: uiModule.external,
            initComponents,
            uiComponents,
            tags
        };
    }

}
