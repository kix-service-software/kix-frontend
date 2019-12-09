/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from "../../server/extensions/IConfigurationExtension";
import { NewConfigItemDialogContext } from "./webapp/core";
import { IConfiguration } from "../../model/configuration/IConfiguration";
import { WidgetConfiguration } from "../../model/configuration/WidgetConfiguration";
import { ConfigurationType } from "../../model/configuration/ConfigurationType";
import { ContextConfiguration } from "../../model/configuration/ContextConfiguration";
import { ConfiguredDialogWidget } from "../../model/configuration/ConfiguredDialogWidget";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { ContextMode } from "../../model/ContextMode";
import { FormFieldConfiguration } from "../../model/configuration/FormFieldConfiguration";
import { VersionProperty } from "./model/VersionProperty";
import { FormFieldOption } from "../../model/configuration/FormFieldOption";
import { ObjectReferenceOptions } from "../../modules/base-components/webapp/core/ObjectReferenceOptions";
import { KIXObjectLoadingOptions } from "../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../model/FilterCriteria";
import { KIXObjectProperty } from "../../model/kix/KIXObjectProperty";
import { SearchOperator } from "../search/model/SearchOperator";
import { FilterDataType } from "../../model/FilterDataType";
import { FilterType } from "../../model/FilterType";
import { GeneralCatalogItemProperty } from "../general-catalog/model/GeneralCatalogItemProperty";
import { ConfigItemProperty } from "./model/ConfigItemProperty";
import { FormGroupConfiguration } from "../../model/configuration/FormGroupConfiguration";
import { FormPageConfiguration } from "../../model/configuration/FormPageConfiguration";
import { FormConfiguration } from "../../model/configuration/FormConfiguration";
import { ConfigurationService } from "../../../../server/services/ConfigurationService";
import { FormContext } from "../../model/configuration/FormContext";
import { ModuleConfigurationService } from "../../server/services/configuration";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewConfigItemDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const dialogWidget = new WidgetConfiguration(
            'cmdb-ci-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-config-item-dialog', 'Translatable#New Config Item',
            [], null, null, false, false, 'kix-icon-new-ci'
        );
        configurations.push(dialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'cmdb-ci-new-dialog-widget', 'cmdb-ci-new-dialog-widget',
                        KIXObjectType.CONFIG_ITEM, ContextMode.CREATE
                    )
                ]
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-config-item-new-form-field-name',
                'Translatable#Name', VersionProperty.NAME, null, true,
                'Translatable#Helptext_CMDB_ConfigItemCreateEdit_Name',
                null, null, null, null, null, 1, 1, 1,
                null, null, null, false, false
            )
        );
        configurations.push(
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
        configurations.push(
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

        configurations.push(
            new FormFieldConfiguration(
                'cmdb-config-item-new-form-field-link',
                'Translatable#Link Config Item with', ConfigItemProperty.LINKS, 'link-input', false,
                'Translatable#Helptext_CMDB_ConfigItemCreateEdit_Links',
                null, null, null, null, null, 1, 1, 1, null, null, null, false, false
            )
        );

        configurations.push(
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

        configurations.push(
            new FormPageConfiguration(
                'cmdb-config-item-new-form-page', 'Translatable#New Config Item',
                ['cmdb-config-item-new-form-group-main']
            )
        );

        const formId = 'cmdb-config-item-new-form';
        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Config Item',
                ['cmdb-config-item-new-form-page'],
                KIXObjectType.CONFIG_ITEM, true
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.CONFIG_ITEM, formId);
        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
