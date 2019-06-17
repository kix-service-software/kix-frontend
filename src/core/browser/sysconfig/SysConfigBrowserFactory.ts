import { KIXObjectFactory } from "../kix/KIXObjectFactory";
import { SysConfigOption } from "../../model/kix/sysconfig/SysConfigOption";

export class SysConfigBrowserFactory extends KIXObjectFactory<SysConfigOption> {

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

    public async create(sysConfig: SysConfigOption): Promise<SysConfigOption> {
        const newSysConfig = new SysConfigOption(sysConfig);
        return newSysConfig;
    }

}
