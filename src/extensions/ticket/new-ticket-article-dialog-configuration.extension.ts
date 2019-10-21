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
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, FormField, ArticleProperty,
    KIXObjectType, Form, FormContext
} from '../../core/model';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTicketArticleContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Translatable#Text Modules', [], {
            // tslint:disable-next-line:max-line-length
            helpText: 'Translatable#Helptext_Textmodules_ArticleCreate'
        },
            false, false, 'kix-icon-textblocks'
        ));

        const sidebars = ['20180919-help-widget'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [helpWidget];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-ticket-article-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const fields: FormField[] = [];
            fields.push(new FormField(
                'Translatable#Channel', ArticleProperty.CHANNEL_ID, 'channel-input', true,
                'Translatable#Helptext_Tickets_ArticleCreate_Channel'
            ));

            const group = new FormGroup('Translatable#Article Data', fields);

            const form = new Form(formId, 'Translatable#New Article', [group], KIXObjectType.ARTICLE);
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.ARTICLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
