/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { NewTicketArticleContext } from '../../core/browser/ticket';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration,
    ArticleProperty, KIXObjectType, FormContext,
    HelpWidgetConfiguration, ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketArticleContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpSettings = new HelpWidgetConfiguration(
            'ticket-article-new-dialog-help-widget-config', 'Help Widget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Textmodules_ArticleCreate', null
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpSettings);

        const helpWidget = new WidgetConfiguration(
            'ticket-article-new-dialog-help-widget', 'Help Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Text Modules', [],
            new ConfigurationDefinition('ticket-article-new-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-textblocks'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpWidget);

        const newDialogWidget = new WidgetConfiguration(
            'ticket-article-new-dialog-widget', 'New Article DIalog Widget', ConfigurationType.Widget,
            'new-ticket-article-dialog', 'Translatable#New Article', [], null, null,
            false, false, 'kix-icon-new-note'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(newDialogWidget);

        return new ContextConfiguration(
            'ticket-article-new-dialog', 'Ticket Article New Dialog', ConfigurationType.Context, this.getModuleId(),
            [
                new ConfiguredWidget('ticket-article-new-dialog-help-widget', 'ticket-article-new-dialog-help-widget')
            ], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'ticket-article-new-dialog-widget', 'ticket-article-new-dialog-widget',
                    KIXObjectType.ARTICLE, ContextMode.CREATE_SUB
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'new-ticket-article-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'ticket-article-new-form-field-channel',
                'Translatable#Channel', ArticleProperty.CHANNEL_ID, 'channel-input', true,
                'Translatable#Helptext_Tickets_ArticleCreate_Channel'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'ticket-article-new-form-group-data', 'Translatable#Article Data',
                [
                    'ticket-article-new-form-field-channel'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(formId, 'Translatable#New Article',
                [
                    'ticket-article-new-form-group-data'
                ],
                KIXObjectType.ARTICLE
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.ARTICLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
