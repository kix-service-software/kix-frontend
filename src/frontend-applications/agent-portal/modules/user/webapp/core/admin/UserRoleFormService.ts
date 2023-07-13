/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { FormContext } from '../../../../../model/configuration/FormContext';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { SysConfigService } from '../../../../sysconfig/webapp/core';
import { Role } from '../../../model/Role';


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

    protected async getValue(
        property: string, value: any, role: Role, formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        if (formContext === FormContext.EDIT && property === RoleProperty.ALLOW_ADMIN_MODULE) {
            const agentPortalConfig = await SysConfigService.getInstance().getAgentPortalConfiguration();
            if (agentPortalConfig.adminRoleIds?.length) {
                return agentPortalConfig.adminRoleIds?.some((rid) => rid === role?.ID);
            }
        }

        return super.getValue(property, value, role, formField, formContext);
    }

}
