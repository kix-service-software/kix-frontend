import { ContextConfiguration, ConfiguredWidget, WidgetConfiguration } from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { ContactImportDialogContext, ContactImportDialogContextConfiguration } from "../../core/browser/contact";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return ContactImportDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const helpWidget = new ConfiguredWidget('20190312-contact-import-help-widget', new WidgetConfiguration(
            'help-widget', null, [], {
                // tslint:disable-next-line:max-line-length
                helpText: 'Translatable#<p>The first line of the source file must contain the column-to-object attribute assignment by using KIX-internal identifiers (e.g. UserLogin, UserCustomerID, UserLastname, etc.). In order to update existing customer data sets, their UserLogin and UserCustomerID must be specified. If new data sets needs to be imported, all mandatory attributes must be given.</p></br><h3>Operation Explanation:</h3><ul><li>Replace empty value = selected attribute will be set to the specified value if no information is given in source file</li><li>Force = selected attribute will be set to the specified value, no matter if a value is defined in the source file or not</li><li>Ignore = selected attribute will be ignored in the import</li>'
            },
            false, false, null, 'kix-icon-query'
        ));

        return new ContactImportDialogContextConfiguration(
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
