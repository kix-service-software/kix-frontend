/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { ConfigItemClass } from '../../../model/ConfigItemClass';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ConfigItemClassProperty } from '../../../model/ConfigItemClassProperty';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';

export class ConfigItemClassFormService extends KIXObjectFormService {

    private static INSTANCE: ConfigItemClassFormService = null;

    public static getInstance(): ConfigItemClassFormService {
        if (!ConfigItemClassFormService.INSTANCE) {
            ConfigItemClassFormService.INSTANCE = new ConfigItemClassFormService();
        }

        return ConfigItemClassFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONFIG_ITEM_CLASS;
    }

    protected async getValue(
        property: string, value: any, ciClass: ConfigItemClass,
        formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        if (property === ConfigItemClassProperty.DEFINITION_STRING && ciClass && ciClass.CurrentDefinition) {
            value = ciClass.CurrentDefinition.DefinitionString;
        } else if (property === ConfigItemClassProperty.NAME && formContext === FormContext.NEW && ciClass) {
            value = await TranslationService.translate(
                'Translatable#Copy of {0}', [value]
            );
        } else {
            value = super.getValue(property, value, ciClass, formField, formContext);
        }

        return value;
    }
}
