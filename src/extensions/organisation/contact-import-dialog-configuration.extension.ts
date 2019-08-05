/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextConfiguration, ConfiguredWidget, WidgetConfiguration } from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { ContactImportDialogContext } from "../../core/browser/contact";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return ContactImportDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const helpWidget = new ConfiguredWidget('20190312-contact-import-help-widget', new WidgetConfiguration(
            'help-widget', null, [], {
                helpText: 'Translatable#Helptext_Customers_ContactImport'
            },
            false, false, 'kix-icon-query'
        ));

        return new ContextConfiguration(
            ContactImportDialogContext.CONTEXT_ID,
            ['20190312-contact-import-help-widget'], [helpWidget]
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
