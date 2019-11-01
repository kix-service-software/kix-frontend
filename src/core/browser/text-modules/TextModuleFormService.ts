/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, TextModule, TextModuleProperty } from "../../model";

export class TextModuleFormService extends KIXObjectFormService<TextModule> {

    private static INSTANCE: TextModuleFormService = null;

    public static getInstance(): TextModuleFormService {
        if (!TextModuleFormService.INSTANCE) {
            TextModuleFormService.INSTANCE = new TextModuleFormService();
        }

        return TextModuleFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TEXT_MODULE;
    }

    protected async getValue(property: string, value: any, textModule: TextModule): Promise<any> {
        switch (property) {
            case TextModuleProperty.KEYWORDS:
                if (value && Array.isArray(value)) {
                    value = value.join(',');
                } else {
                    value = value;
                }
                break;
            default:
        }
        return value;
    }


}
