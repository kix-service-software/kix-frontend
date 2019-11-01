/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, KIXObjectType, KIXObjectLoadingOptions, WidgetConfiguration, ContextMode,
    ConfiguredDialogWidget, FormContext, VersionProperty, FormFieldOption, ObjectReferenceOptions,
    FilterCriteria, KIXObjectProperty, FilterType, FilterDataType, GeneralCatalogItemProperty
} from '../../core/model';
import { EditConfigItemDialogContext } from '../../core/browser/cmdb';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';
import {
    FormConfiguration, FormGroupConfiguration, FormFieldConfiguration
} from '../../core/model/components/form/configuration';
import { SearchOperator } from '../../core/browser';
import { ConfigurationService } from '../../core/services';

export class EditConfigItemDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditConfigItemDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const dialogWidget = new WidgetConfiguration(
            'cmdb-ci-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-config-item-dialog', 'Translatable#Edit Config Item',
            [], null, null, false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(dialogWidget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'cmdb-ci-edit-dialog-widget', 'cmdb-ci-edit-dialog-widget',
                    KIXObjectType.CONFIG_ITEM, ContextMode.EDIT
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-config-item-edit-form-field-class',
                'Translatable#Config Item Class', VersionProperty.CLASS_ID, null, false,
                'Translatable#Helptext_CMDB_ConfigItemCreateEdit_Class',
                null, null, null, null, null, 1, 1, 1,
                null, null, null, false, false, true
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-config-item-edit-form-field-name',
                'Translatable#Name', VersionProperty.NAME, null, true,
                'Translatable#Helptext_CMDB_ConfigItemCreateEdit_Name',
                null, null, null, null, null, 1, 1, 1,
                null, null, null, false, false
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
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
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-config-item-edit-form-field-incidentstate',
                'Translatable#Incident state', VersionProperty.INCI_STATE_ID, 'object-reference-input',
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        const formId = 'cmdb-config-item-edit-form';
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Edit Config Item',
                [
                    'cmdb-config-item-edit-form-group-main'
                ],
                KIXObjectType.CONFIG_ITEM, true, FormContext.EDIT
            )
        );

        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.CONFIG_ITEM, formId);
    }

}

module.exports = (data, host, options) => {
    return new EditConfigItemDialogModuleExtension();
};
