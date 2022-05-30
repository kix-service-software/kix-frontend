/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NewTicketArticleContext } from './webapp/core';
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
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { ArticleProperty } from './model/ArticleProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketArticleContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const helpSettings = new HelpWidgetConfiguration(
            'ticket-article-new-dialog-help-widget-config', 'Help Widget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Textmodules_ArticleCreate', null
        );
        configurations.push(helpSettings);

        const helpWidget = new WidgetConfiguration(
            'ticket-article-new-dialog-help-widget', 'Help Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Text Modules', [],
            new ConfigurationDefinition('ticket-article-new-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, true, 'kix-icon-textblocks'
        );
        configurations.push(helpWidget);

        const newDialogWidget = new WidgetConfiguration(
            'ticket-article-new-dialog-widget', 'New Article DIalog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Article', [], null, null,
            false, false, 'kix-icon-new-note'
        );
        configurations.push(newDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Ticket Article New Dialog', ConfigurationType.Context, this.getModuleId(),
                [
                    new ConfiguredWidget(
                        'ticket-article-new-dialog-help-widget', 'ticket-article-new-dialog-help-widget'
                    )
                ], [], [],
                [
                    new ConfiguredDialogWidget(
                        'ticket-article-new-dialog-widget', 'ticket-article-new-dialog-widget',
                        KIXObjectType.ARTICLE, ContextMode.CREATE_SUB
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'ticket-article-new-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'ticket-article-new-form-field-channel',
                'Translatable#Channel', ArticleProperty.CHANNEL_ID, 'channel-input', true,
                'Translatable#Helptext_Tickets_ArticleCreate_Channel'
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'ticket-article-new-form-group-data', 'Translatable#Article Data',
                [
                    'ticket-article-new-form-field-channel'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'ticket-article-new-form-page', 'Translatable#New Article',
                ['ticket-article-new-form-group-data']
            )
        );

        configurations.push(
            new FormConfiguration(formId, 'Translatable#New Article',
                ['ticket-article-new-form-page'],
                KIXObjectType.ARTICLE
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.ARTICLE, formId);
        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
