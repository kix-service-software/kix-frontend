/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { HelpWidgetConfiguration } from '../../model/configuration/HelpWidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ContactImportDialogContext } from './webapp/core/context/ContactImportDialogContext';

class Extension extends KIXExtension implements IConfigurationExtension {

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
            null, false, true, 'kix-icon-query'
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
                [], [],
                [
                    new ConfiguredDialogWidget(
                        'contact-import-dialog-widget', 'contact-import-dialog-widget',
                        KIXObjectType.CONTACT, ContextMode.IMPORT
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
