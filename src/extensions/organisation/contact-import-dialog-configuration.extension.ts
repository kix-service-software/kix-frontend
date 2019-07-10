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
                helpText: 'Translatable#Helptext_Organisations_ContactImport'
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
