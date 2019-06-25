import { KIXObjectFactory } from "../kix/KIXObjectFactory";
import { SysConfigOptionDefinition } from "../../model/kix/sysconfig/SysConfigOptionDefinition";

export class SysConfigOptionDefinitionBrowserFactory extends KIXObjectFactory<SysConfigOptionDefinition> {

    private static INSTANCE: SysConfigOptionDefinitionBrowserFactory;

    public static getInstance(): SysConfigOptionDefinitionBrowserFactory {
        if (!SysConfigOptionDefinitionBrowserFactory.INSTANCE) {
            SysConfigOptionDefinitionBrowserFactory.INSTANCE = new SysConfigOptionDefinitionBrowserFactory();
        }
        return SysConfigOptionDefinitionBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(sysConfig: SysConfigOptionDefinition): Promise<SysConfigOptionDefinition> {
        const newSysConfig = new SysConfigOptionDefinition(sysConfig);
        return newSysConfig;
    }

}
