/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { Organisation } from '../../model/Organisation';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormContext } from '../../../../model/configuration/FormContext';
import { OrganisationProperty } from '../../model/OrganisationProperty';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class OrganisationFormService extends KIXObjectFormService {

    private static INSTANCE: OrganisationFormService;

    public static getInstance(): OrganisationFormService {
        if (!OrganisationFormService.INSTANCE) {
            OrganisationFormService.INSTANCE = new OrganisationFormService();
        }
        return OrganisationFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.ORGANISATION;
    }

    protected async getValue(
        property: string, value: any, organisation: Organisation,
        formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        switch (property) {
            case OrganisationProperty.NUMBER:
                if (formContext === FormContext.NEW) {
                    value = null;
                }
                break;
            case OrganisationProperty.NAME:
                if (formContext === FormContext.NEW && organisation) {
                    const orgName = await TranslationService.translate(
                        'Translatable#Copy of {0}', [value]
                    );
                    value = orgName;
                }
                break;
            default:
                value = await super.getValue(property, value, organisation, formField, formContext);
        }

        return value;
    }


}
