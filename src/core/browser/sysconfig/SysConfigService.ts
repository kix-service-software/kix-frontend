import { KIXObjectService } from "../kix";
import { SysConfigOption, KIXObjectType } from "../../model";

export class SysConfigService extends KIXObjectService<SysConfigOption> {

    private static INSTANCE: SysConfigService = null;

    public static getInstance(): SysConfigService {
        if (!SysConfigService.INSTANCE) {
            SysConfigService.INSTANCE = new SysConfigService();
        }

        return SysConfigService.INSTANCE;
    }

    public async init(): Promise<void> {
        await this.loadObjects(KIXObjectType.SYS_CONFIG_OPTION, null);
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.SYS_CONFIG_OPTION;
    }

    public getLinkObjectName(): string {
        return 'Sysconfig';
    }
}
