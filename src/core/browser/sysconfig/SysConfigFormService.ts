/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
