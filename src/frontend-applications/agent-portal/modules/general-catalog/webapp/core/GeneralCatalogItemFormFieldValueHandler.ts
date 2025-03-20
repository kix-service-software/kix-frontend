/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldValueHandler } from '../../../base-components/webapp/core/FormFieldValueHandler';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { GeneralCatalogItemProperty } from '../../model/GeneralCatalogItemProperty';
import { GeneralCatalogFormService } from '.';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../base-components/webapp/core/ServiceType';

export class GeneralCatalogItemFormFieldValueHandler extends FormFieldValueHandler {

    public objectType: string = KIXObjectType.GENERAL_CATALOG_ITEM;

    public id: string = 'GeneralCatalogItemFormFieldValueHandler';

    public async handleFormFieldValues(
        formInstance: FormInstance, changedFieldValues: Array<[FormFieldConfiguration, FormFieldValue]>
    ): Promise<void> {
        const classValue = changedFieldValues.find(
            (cv) => cv[0] && cv[0].property === GeneralCatalogItemProperty.CLASS
        );
        if (classValue && classValue[1]?.value) {

            // TODO: only handle "Functionality" preference for the moment
            if (
                classValue[1]?.value === 'ITSM::ConfigItem::DeploymentState' ||
                classValue[1]?.value === 'ITSM::Core::IncidentState'
            ) {
                const formService = ServiceRegistry.getServiceInstance<GeneralCatalogFormService>(
                    KIXObjectType.GENERAL_CATALOG_ITEM, ServiceType.FORM
                );
                if (formService) {
                    formService.setFunctionalityField(formInstance, classValue[1]?.value);
                }
            } else {
                const functionalityField = formInstance.getFormFieldByProperty('Functionality');
                if (functionalityField) {
                    formInstance.removeFormField(functionalityField);
                }
            }
        }
    }
}
