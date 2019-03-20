import { KIXObjectService } from "../kix";
import { SysConfigItem, KIXObjectType } from "../../model";

export class SysConfigService extends KIXObjectService<SysConfigItem> {

    private static INSTANCE: SysConfigService = null;

    public static getInstance(): SysConfigService {
        if (!SysConfigService.INSTANCE) {
            SysConfigService.INSTANCE = new SysConfigService();
        }

        return SysConfigService.INSTANCE;
    }

    public async init(): Promise<void> {
        await this.loadObjects(KIXObjectType.SYS_CONFIG_ITEM, null);
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.SYS_CONFIG_ITEM;
    }

    public getLinkObjectName(): string {
        return 'Sysconfig';
    }
}
