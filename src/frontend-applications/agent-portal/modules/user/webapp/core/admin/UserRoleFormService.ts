/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { RoleProperty } from '../../../model/RoleProperty';
import { KIXObjectSpecificCreateOptions } from '../../../../../model/KIXObjectSpecificCreateOptions';
import { RoleUsageContextTypes } from '../../../model/RoleUsageContextTypes';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';


export class UserRoleFormService extends KIXObjectFormService {

    private static INSTANCE: UserRoleFormService = null;

    public static getInstance(): UserRoleFormService {
        if (!UserRoleFormService.INSTANCE) {
            UserRoleFormService.INSTANCE = new UserRoleFormService();
        }

        return UserRoleFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.ROLE;
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        if (value) {
            if (property === RoleProperty.USER_IDS || property === RoleProperty.PERMISSIONS) {
                if (Array.isArray(value) && !!value.length) {
                    parameter.push([property, value]);
                }
            } else {
                parameter.push([property, value]);
            }
        }

        return parameter;
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<Array<[string, any]>> {

        const contextParameter = parameter.find((p) => p[0] === RoleProperty.USAGE_CONTEXT);

        if (contextParameter) {
            let usageContext = 0;
            if (contextParameter[1].some((v) => v === RoleUsageContextTypes.AGENT)) {
                usageContext += 1;
            }
            if (contextParameter[1].some((v) => v === RoleUsageContextTypes.CUSTOMER)) {
                usageContext += 2;
            }
            contextParameter[1] = usageContext.toString();
        }

        return parameter;
    }

}
