/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../../../../modules/base-components/webapp/core/KIXObjectFormService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TextModuleProperty } from "../../model/TextModuleProperty";
import { TextModule } from "../../model/TextModule";

export class TextModuleFormService extends KIXObjectFormService {

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
                }
                break;
            default:
        }
        return value;
    }

    public async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        switch (property) {
            case TextModuleProperty.KEYWORDS:
                value = value ? value.split(/[,;\s]\s?/) : undefined;
                break;
            default:
        }
        return [[property, value]];
    }

}
