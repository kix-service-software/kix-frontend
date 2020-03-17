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
import { FormConfiguration } from "../../../../model/configuration/FormConfiguration";
import { FormFieldValue } from "../../../../model/configuration/FormFieldValue";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { EditSysConfigDialogContext } from ".";
import { SysConfigOptionDefinition } from "../../model/SysConfigOptionDefinition";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { SysConfigOptionDefinitionProperty } from "../../model/SysConfigOptionDefinitionProperty";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { KIXObjectService } from "../../../../modules/base-components/webapp/core/KIXObjectService";
import { KIXObjectSpecificCreateOptions } from "../../../../model/KIXObjectSpecificCreateOptions";

export class SysConfigFormService extends KIXObjectFormService {

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
        return kixObjectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION
            || kixObjectType === KIXObjectType.SYS_CONFIG_OPTION;
    }

    public async initValues(form: FormConfiguration): Promise<Map<string, FormFieldValue<any>>> {
        const context = await ContextService.getInstance().getContext<EditSysConfigDialogContext>(
            EditSysConfigDialogContext.CONTEXT_ID
        );
        const sysConfigId = context ? context.getObjectId() : null;
        const sysConfigValues = sysConfigId
            ? await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
                KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, [sysConfigId]) : null;
        return await super.initValues(form, sysConfigValues ? sysConfigValues[0] : null);
    }

    protected async getValue(
        property: string, value: any, sysConfig: SysConfigOptionDefinition, formField: FormFieldConfiguration
    ): Promise<any> {
        let formValue = value;
        if (sysConfig) {
            switch (property) {
                case SysConfigOptionDefinitionProperty.SETTING:
                    if (value && Array.isArray(value)) {
                        formValue = value.join(',');
                    } else {
                        formValue = value;
                    }
                    break;
                case SysConfigOptionDefinitionProperty.DEFAULT:
                    if (typeof formValue !== 'string' && typeof formValue !== 'number') {
                        formValue = JSON.stringify(value);
                    }
                    break;
                case SysConfigOptionDefinitionProperty.VALUE:
                    if (sysConfig.IsModified !== 1) {
                        formValue = sysConfig.Default;
                    }

                    if (typeof formValue !== 'string' && typeof formValue !== 'number') {
                        formValue = JSON.stringify(formValue);
                    }

                    if (formValue === null) {
                        formValue = '';
                    }
                    break;
                case SysConfigOptionDefinitionProperty.DEFAULT_VALID_ID:
                case KIXObjectProperty.VALID_ID:
                    if (sysConfig.IsRequired) {
                        formField.readonly = true;
                    }
                    break;
                default:
            }
        }
        return formValue;
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<Array<[string, any]>> {

        const defaultParameter = parameter.find((p) => p[0] === SysConfigOptionDefinitionProperty.DEFAULT);
        const value = parameter.find((p) => p[0] === SysConfigOptionDefinitionProperty.VALUE);
        if (value && defaultParameter && value[1] === defaultParameter[1]) {
            value[1] = null;
        }

        const defaultValidParameter = parameter.find(
            (p) => p[0] === SysConfigOptionDefinitionProperty.DEFAULT_VALID_ID
        );
        const valid = parameter.find((p) => p[0] === KIXObjectProperty.VALID_ID);
        if (valid && defaultValidParameter && valid[1] === defaultValidParameter[1]) {
            valid[1] = null;
        }

        return parameter;
    }
}
