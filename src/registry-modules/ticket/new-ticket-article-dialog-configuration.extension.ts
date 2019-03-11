import { IConfigurationExtension } from '../../core/extensions';
import { NewTicketArticleContextConfiguration, NewTicketArticleContext } from '../../core/browser/ticket';
import {
    ContextConfiguration, ConfiguredWidget, WidgetSize, WidgetConfiguration, TicketProperty,
    FormField, ArticleProperty, KIXObjectType, Form, FormContext, FormFieldOption, FormFieldValue, FormFieldOptions
} from '../../core/model';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { AutocompleteOption, AutocompleteFormFieldOption } from '../../core/browser/components';
import { ConfigurationService } from '../../core/services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketArticleContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Translatable#Text Modules', [], {
                // tslint:disable-next-line:max-line-length
                helpText: 'Translatable#<b>-- KIX Professional Feature--</b><p>To use the text modules available in your system, enter „::“ (colon colon). Then choose the text modules you want to use in the context menu. You can narrow down the key word selection manually by entering more text.</p>'
            },
            false, false, WidgetSize.BOTH, 'kix-icon-textblocks'
        ));

        const sidebars = ['20180919-help-widget'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [helpWidget];

        return new NewTicketArticleContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-ticket-article-form';
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                'Translatable#Channel', ArticleProperty.CHANNEL_ID, 'channel-input', true, 'Translatable#Channel')
            );

            const group = new FormGroup('Translatable#Article Data', fields);

            const form = new Form(formId, 'Translatable#New Article', [group], KIXObjectType.ARTICLE);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.ARTICLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
