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
import { ConfigurationType, ConfigurationDefinition } from "../../core/model/configuration";
import { ModuleConfigurationService } from "../../services";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return ContactImportDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpSettings = new HelpWidgetConfiguration(
            'contact-import-dialog-help-widget-config', 'Help Widget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Customers_ContactImport', null
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpSettings);

        const helpWidget = new WidgetConfiguration(
            'contact-import-dialog-help-widget', 'Help Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Help', [],
            new ConfigurationDefinition('contact-import-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-query'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpWidget);

        const widget = new WidgetConfiguration(
            'contact-import-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'import-dialog', 'Translatable#Import Contacts', [], null, null, false, false, 'kix-icon-man-bubble-new'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
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
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
