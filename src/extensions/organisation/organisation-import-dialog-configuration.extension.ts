/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, HelpWidgetConfiguration,
    ConfiguredDialogWidget, KIXObjectType, ContextMode
} from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { OrganisationImportDialogContext } from "../../core/browser/organisation";
import { ConfigurationType, ConfigurationDefinition, IConfiguration } from "../../core/model/configuration";
import { ModuleConfigurationService } from "../../services";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return OrganisationImportDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const helpSettings = new HelpWidgetConfiguration(
            'organisation-import-dialog-help-widget-config', 'Help Widget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Customers_OrganisationImport', null
        );
        configurations.push(helpSettings);

        const helpWidget = new WidgetConfiguration(
            'organisation-import-dialog-help-widget', 'Help Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Help', [],
            new ConfigurationDefinition('organisation-import-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-textblocks'
        );
        configurations.push(helpWidget);


        const widget = new WidgetConfiguration(
            'organisation-import-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'import-dialog', 'Translatable#Import Organisations', [], null, null,
            false, false, 'kix-icon-man-house-new'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Organisation Import Dialog', ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget(
                        'organisation-import-dialog-help-widget', 'organisation-import-dialog-help-widget'
                    )
                ],
                [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'organisation-import-dialog-widget', 'organisation-import-dialog-widget',
                        KIXObjectType.ORGANISATION, ContextMode.IMPORT
                    )
                ]
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
