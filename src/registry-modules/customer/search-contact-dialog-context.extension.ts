import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ContextConfiguration, KIXObjectType,
    FormContext, SearchForm, ContactProperty, ConfiguredWidget, WidgetConfiguration, WidgetSize
} from '@kix/core/dist/model';
import { ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';
import { ContactSearchContext, ContactSearchContextConfiguration } from '@kix/core/dist/browser/contact';

export class ModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return ContactSearchContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Hilfe', [], {
                helpText: '<h1>Komplexsuche</h1><h2>Suchoperatoren</h2><ul><li>EQUALS</li><li>CONTAINS</li></ul>'
            }, false, false, WidgetSize.BOTH, 'kix-icon-query', false, null, false
        ));
        const sidebarWidgets = [helpWidget];
        const sidebars = ['20180919-help-widget'];
        return new ContactSearchContextConfiguration(
            ContactSearchContext.CONTEXT_ID, [], sidebars, sidebarWidgets, [], []
        );
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formId = 'search-contact-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm) {
            const form = new SearchForm(
                formId,
                'Ansprechpartner',
                KIXObjectType.CONTACT,
                FormContext.SEARCH,
                null,
                false,
                [
                    ContactProperty.USER_FIRST_NAME, ContactProperty.USER_LAST_NAME,
                    ContactProperty.USER_EMAIL, ContactProperty.USER_LOGIN
                ]
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.SEARCH], KIXObjectType.CONTACT, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
