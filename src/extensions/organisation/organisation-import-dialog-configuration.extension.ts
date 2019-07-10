import { ContextConfiguration, ConfiguredWidget, WidgetConfiguration } from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { OrganisationImportDialogContext } from "../../core/browser/organisation";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return OrganisationImportDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const helpWidget = new ConfiguredWidget('20190301-organisation-import-help-widget', new WidgetConfiguration(
            'help-widget', null, [], {
                helpText: 'Translatable#Helptext_Organisations_OrganisationImport'
            },
            false, false, 'kix-icon-query'
        ));

        return new ContextConfiguration(
            OrganisationImportDialogContext.CONTEXT_ID,
            ['20190301-organisation-import-help-widget'], [helpWidget]
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
