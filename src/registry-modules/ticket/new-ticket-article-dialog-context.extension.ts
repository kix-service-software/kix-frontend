import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { NewTicketArticleContextConfiguration, NewTicketArticleContext } from '@kix/core/dist/browser/ticket';
import {
    ContextConfiguration, ConfiguredWidget, WidgetSize, WidgetConfiguration, TicketProperty,
    FormField, ArticleProperty, KIXObjectType, Form, FormContext, FormFieldOption, FormFieldValue, FormFieldOptions
} from '@kix/core/dist/model';
import { FormGroup } from '@kix/core/dist/model/components/form/FormGroup';
import { AutocompleteOption, AutocompleteFormFieldOption } from '@kix/core/dist/browser/components';
import { ConfigurationService } from '@kix/core/dist/services';

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewTicketArticleContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Textbausteine', [], {
                // tslint:disable-next-line:max-line-length
                helpText: '<b>-- KIX Professional Feature --</b><p>Um die in Ihrem System verfügbaren Textbausteine zu nutzen, geben Sie "::" (Doppelpunkt Doppelpunkt) ein. Wählen Sie anschließend im Kontextmenü den gewünschten Textbaustein aus. Sie können die Auswahl anhand der Schlüsselworte manuell einschränken, in dem sie weiteren Text eingeben.</p>'
            },
            false, false, WidgetSize.BOTH, 'kix-icon-textblocks'
        ));

        const sidebars = ['20180919-help-widget'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [helpWidget];

        return new NewTicketArticleContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-ticket-article-form';
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing) {
            const fields: FormField[] = [];
            fields.push(new FormField("Betreff", TicketProperty.TITLE, null, true, "Betreff"));
            fields.push(new FormField(
                "Artikelinhalt", ArticleProperty.BODY, 'rich-text-input', true, "Beschreibung", [
                    new FormFieldOption(FormFieldOptions.AUTO_COMPLETE, new AutocompleteFormFieldOption([
                        new AutocompleteOption(KIXObjectType.TEXT_MODULE, '::')
                    ]))
                ])
            );
            fields.push(new FormField("Anlagen", ArticleProperty.ATTACHMENT, 'attachment-input', false, "Anlagen"));

            const group = new FormGroup('Artikeldaten', fields);

            const form = new Form(formId, 'Neuer Artikel', [group], KIXObjectType.ARTICLE);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.ARTICLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
