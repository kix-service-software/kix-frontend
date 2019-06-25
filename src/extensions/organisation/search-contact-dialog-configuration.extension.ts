import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, KIXObjectType,
    FormContext, SearchForm, ContactProperty, ConfiguredWidget, WidgetConfiguration, WidgetSize, CRUD
} from '../../core/model';
import { ContactSearchContext } from '../../core/browser/contact';
import { ConfigurationService } from '../../core/services';
import { SearchProperty } from '../../core/browser';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ContactSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpWidget = new ConfiguredWidget('20180919-help-widget',
            new WidgetConfiguration(
                'help-widget', 'Translatable#Help', [], { helpText: 'Translatable#Helptext_Search_Contact' },
                false, false, 'kix-icon-query', false
            ),
            [new UIComponentPermission('faq/articles', [CRUD.READ])]
        );
        const sidebarWidgets = [helpWidget];
        const sidebars = ['20180919-help-widget'];
        return new ContextConfiguration(
            ContactSearchContext.CONTEXT_ID, sidebars, sidebarWidgets
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'search-contact-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm || overwrite) {
            const form = new SearchForm(
                formId,
                'Ansprechpartner',
                KIXObjectType.CONTACT,
                FormContext.SEARCH,
                null,
                [
                    SearchProperty.FULLTEXT,
                    ContactProperty.FIRST_NAME, ContactProperty.LAST_NAME,
                    ContactProperty.EMAIL, ContactProperty.LOGIN
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
