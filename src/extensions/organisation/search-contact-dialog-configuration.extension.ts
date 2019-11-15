/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, KIXObjectType, FormContext, SearchForm, ContactProperty,
    ConfiguredWidget, WidgetConfiguration, CRUD, HelpWidgetConfiguration, ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import { ContactSearchContext } from '../../core/browser/contact';
import { ConfigurationService } from '../../core/services';
import { SearchProperty } from '../../core/browser';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { ConfigurationType, ConfigurationDefinition, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ContactSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const helpSettings = new HelpWidgetConfiguration(
            'contact-search-dialog-help-widget-config', 'Help Widget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Search_Contact',
            []
        );
        configurations.push(helpSettings);

        const helpWidget = new WidgetConfiguration(
            'contact-search-dialog-help-widget', 'Help Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Help', [],
            new ConfigurationDefinition('contact-search-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-textblocks'
        );
        configurations.push(helpWidget);


        const widget = new WidgetConfiguration(
            'contact-search-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'search-contact-dialog', 'Translatable#Contact Search', [],
            null, null, false, false, 'kix-icon-search-man-bubble'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Contact Search Dialog', ConfigurationType.Context,
                this.getModuleId(),
                [
                    new ConfiguredWidget(
                        'contact-search-dialog-help-widget', 'contact-search-dialog-help-widget', null,
                        [new UIComponentPermission('faq/articles', [CRUD.READ])]
                    )
                ],
                [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'contact-search-dialog-widget', 'contact-search-dialog-widget',
                        KIXObjectType.CONTACT, ContextMode.SEARCH
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'contact-search-form';
        configurations.push(
            new SearchForm(
                formId, 'Ansprechpartner', KIXObjectType.CONTACT, FormContext.SEARCH, null,
                [
                    SearchProperty.FULLTEXT,
                    ContactProperty.FIRSTNAME, ContactProperty.LASTNAME,
                    ContactProperty.EMAIL, ContactProperty.LOGIN
                ]
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.SEARCH], KIXObjectType.CONTACT, formId);
        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
