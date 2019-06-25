import { KIXModulesSocketClient } from "./KIXModulesSocketClient";
import { IKIXModuleExtension } from "../../extensions";

export class KIXModulesService {

    private static INSTANCE: KIXModulesService;

    public static getInstance(): KIXModulesService {
        if (!KIXModulesService.INSTANCE) {
            KIXModulesService.INSTANCE = new KIXModulesService();
        }
        return KIXModulesService.INSTANCE;
    }

    private constructor() { }

    private modules: IKIXModuleExtension[] = [];

    private tags: Map<string, string>;

    public async init(): Promise<void> {
        this.tags = new Map();
        this.modules = await KIXModulesSocketClient.getInstance().loadModules();

        this.modules.forEach((m) => {
            m.uiComponents.forEach((c) => this.tags.set(c.tagId, c.componentPath));
        });
    }

    public getModules(): IKIXModuleExtension[] {
        return this.modules;
    }

    public static getComponentTemplate(componentId: string): any {
        const component = this.getInstance().tags.get(componentId);
        const template = component ? require(component) : undefined;
        return template;
    }

}
