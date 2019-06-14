import { KIXObjectFactory } from "../kix/KIXObjectFactory";
import { SysConfigItem } from "../../model/kix/sysconfig/SysConfigItem";

export class SysConfigBrowserFactory extends KIXObjectFactory<SysConfigItem> {

    private static INSTANCE: SysConfigBrowserFactory;

    public static getInstance(): SysConfigBrowserFactory {
        if (!SysConfigBrowserFactory.INSTANCE) {
            SysConfigBrowserFactory.INSTANCE = new SysConfigBrowserFactory();
        }
        return SysConfigBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(sysConfig: SysConfigItem): Promise<SysConfigItem> {
        const newSysConfig = new SysConfigItem(sysConfig);
        return newSysConfig;
    }

}
