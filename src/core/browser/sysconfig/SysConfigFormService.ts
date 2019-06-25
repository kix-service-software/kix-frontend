import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType } from "../../model";
import { SysConfigOption } from "../../model/kix/sysconfig/SysConfigOption";

export class SysConfigFormService extends KIXObjectFormService<SysConfigOption> {

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
        return kixObjectType === KIXObjectType.SYS_CONFIG_OPTION;
    }
}
