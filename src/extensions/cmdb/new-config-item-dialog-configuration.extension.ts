/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextConfiguration, KIXObjectType, KIXObjectLoadingOptions, WidgetConfiguration, ConfiguredDialogWidget,
    ContextMode, ConfigItemProperty, ObjectReferenceOptions, FormFieldOption, FilterCriteria,
    GeneralCatalogItemProperty, FilterDataType, KIXObjectProperty, FilterType, VersionProperty, FormContext
} from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { NewConfigItemDialogContext } from "../../core/browser/cmdb";
import { ConfigurationType } from "../../core/model/configuration";
import { ModuleConfigurationService } from "../../services";
import {
    FormConfiguration, FormGroupConfiguration, FormFieldConfiguration
} from "../../core/model/components/form/configuration";
import { SearchOperator } from "../../core/browser";
import { ConfigurationService } from "../../core/services";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewConfigItemDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const dialogWidget = new WidgetConfiguration(
            'cmdb-ci-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-config-item-dialog', 'Translatable#New Config Item',
            [], null, null, false, false, 'kix-icon-new-ci'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(dialogWidget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'cmdb-ci-new-dialog-widget', 'cmdb-ci-new-dialog-widget',
                    KIXObjectType.CONFIG_ITEM, ContextMode.CREATE
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-config-item-new-form-field-name',
                'Translatable#Name', VersionProperty.NAME, null, true,
                'Translatable#Helptext_CMDB_ConfigItemCreateEdit_Name',
                null, null, null, null, null, 1, 1, 1,
                null, null, null, false, false
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-config-item-new-form-field-deploymentstate',
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
                'cmdb-config-item-new-form-field-incidentstate',
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
            new FormFieldConfiguration(
                'cmdb-config-item-new-form-field-link',
                'Translatable#Link Config Item with', ConfigItemProperty.LINKS, 'link-input', false,
                'Translatable#Helptext_CMDB_ConfigItemCreateEdit_Links',
                null, null, null, null, null, 1, 1, 1, null, null, null, false, false
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'cmdb-config-item-new-form-group-main', 'Translatable#Config Item Data',
                [
                    'cmdb-config-item-new-form-field-name',
                    'cmdb-config-item-new-form-field-deploymentstate',
                    'cmdb-config-item-new-form-field-incidentstate',
                    'cmdb-config-item-new-form-field-link',
                ]
            )
        );

        const formId = 'cmdb-config-item-new-form';
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Edit Config Item',
                [
                    'cmdb-config-item-new-form-group-main'
                ],
                KIXObjectType.CONFIG_ITEM, true
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.CONFIG_ITEM, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
