/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { EditConfigItemDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { VersionProperty } from './model/VersionProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { GeneralCatalogItemProperty } from '../general-catalog/model/GeneralCatalogItemProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ConfigItemProperty } from './model/ConfigItemProperty';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditConfigItemDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const dialogWidget = new WidgetConfiguration(
            'cmdb-ci-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Config Item',
            [], null, null, false, false, 'kix-icon-edit'
        );
        configurations.push(dialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'cmdb-ci-edit-dialog-widget', 'cmdb-ci-edit-dialog-widget',
                        KIXObjectType.CONFIG_ITEM, ContextMode.EDIT
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-config-item-edit-form-field-class',
                'Translatable#Config Item Class', VersionProperty.CLASS_ID, null, false,
                'Translatable#Helptext_CMDB_ConfigItemCreateEdit_Class',
                null, null, null, null, null, 1, 1, 1,
                null, null, null, false, false, true
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'cmdb-config-item-edit-form-field-name',
                'Translatable#Name', VersionProperty.NAME, null, true,
                'Translatable#Helptext_CMDB_ConfigItemCreateEdit_Name',
                null, null, null, null, null, 1, 1, 1,
                null, null, null, false, false
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-config-item-edit-form-field-deploymentstate',
                'Translatable#Deployment State', VersionProperty.DEPL_STATE_ID, 'object-reference-input',
                true, 'Translatable#Helptext_CMDB_ConfigItemCreateEdit_DeploymentState',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.GENERAL_CATALOG_ITEM),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions([
                            new FilterCriteria(
                                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                FilterType.AND, 1
                            ),
                            new FilterCriteria(
                                GeneralCatalogItemProperty.CLASS, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.AND, 'ITSM::ConfigItem::DeploymentState'
                            )
                        ])
                    ),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false)
                ],
                null, null, null, null, 1, 1, 1, null, null, null, false, false
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-config-item-edit-form-field-incidentstate',
                'Translatable#Incident state', ConfigItemProperty.CUR_INCI_STATE_ID, 'object-reference-input',
                true, 'Translatable#Helptext_CMDB_ConfigItemCreateEdit_IncidentState',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.GENERAL_CATALOG_ITEM),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions([
                            new FilterCriteria(
                                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                FilterType.AND, 1
                            ),
                            new FilterCriteria(
                                GeneralCatalogItemProperty.CLASS, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.AND, 'ITSM::Core::IncidentState'
                            )
                        ])
                    ),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false)
                ],
                null, null, null, null, 1, 1, 1, null, null, null, false, false
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'cmdb-config-item-edit-form-group-main', 'Translatable#Config Item Data',
                [
                    'cmdb-config-item-edit-form-field-class',
                    'cmdb-config-item-edit-form-field-name',
                    'cmdb-config-item-edit-form-field-deploymentstate',
                    'cmdb-config-item-edit-form-field-incidentstate'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'cmdb-config-item-edit-form-page', 'Translatable#Edit Config Item',
                ['cmdb-config-item-edit-form-group-main']
            )
        );

        const formId = 'cmdb-config-item-edit-form';
        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Config Item',
                ['cmdb-config-item-edit-form-page'],
                KIXObjectType.CONFIG_ITEM, true, FormContext.EDIT
            )
        );

        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.CONFIG_ITEM, formId);

        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
