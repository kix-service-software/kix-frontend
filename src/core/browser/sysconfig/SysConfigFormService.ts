import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType } from "../../model";
import { SysConfigItem } from "../../model/kix/sysconfig/SysConfigItem";

export class SysConfigFormService extends KIXObjectFormService<SysConfigItem> {

    private static INSTANCE: SysConfigFormService = null;

    public static getInstance(): SysConfigFormService {
        if (!SysConfigFormService.INSTANCE) {
            SysConfigFormService.INSTANCE = new SysConfigFormService();
        }

        return SysConfigFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.SYS_CONFIG_ITEM;
    }
}
