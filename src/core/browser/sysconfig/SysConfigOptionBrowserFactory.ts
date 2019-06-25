import { KIXObjectFactory } from "../kix/KIXObjectFactory";
import { SysConfigOption } from "../../model/kix/sysconfig/SysConfigOption";

export class SysConfigOptionBrowserFactory extends KIXObjectFactory<SysConfigOption> {

    private static INSTANCE: SysConfigOptionBrowserFactory;

    public static getInstance(): SysConfigOptionBrowserFactory {
        if (!SysConfigOptionBrowserFactory.INSTANCE) {
            SysConfigOptionBrowserFactory.INSTANCE = new SysConfigOptionBrowserFactory();
        }
        return SysConfigOptionBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(sysConfig: SysConfigOption): Promise<SysConfigOption> {
        const newSysConfig = new SysConfigOption(sysConfig);
        return newSysConfig;
    }

}
