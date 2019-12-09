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
import { ContactImportDialogContext } from "../../core/browser/contact";
import { ConfigurationType, ConfigurationDefinition, IConfiguration } from "../../core/model/configuration";
import { ModuleConfigurationService } from "../../services";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return ContactImportDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const helpSettings = new HelpWidgetConfiguration(
            'contact-import-dialog-help-widget-config', 'Help Widget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Customers_ContactImport', null
        );
        configurations.push(helpSettings);

        const helpWidget = new WidgetConfiguration(
            'contact-import-dialog-help-widget', 'Help Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Help', [],
            new ConfigurationDefinition('contact-import-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-query'
        );
        configurations.push(helpWidget);

        const widget = new WidgetConfiguration(
            'contact-import-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'import-dialog', 'Translatable#Import Contacts', [], null, null, false, false, 'kix-icon-man-bubble-new'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Contact Import Dialog', ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget('contact-import-dialog-help-widget', 'contact-import-dialog-help-widget')
                ],
                [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'contact-import-dialog-widget', 'contact-import-dialog-widget',
                        KIXObjectType.CONTACT, ContextMode.IMPORT
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
