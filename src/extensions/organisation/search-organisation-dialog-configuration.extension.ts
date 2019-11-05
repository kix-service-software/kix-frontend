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
    ContextConfiguration, KIXObjectType,
    FormContext, SearchForm, OrganisationProperty, ConfiguredWidget, WidgetConfiguration,
    CRUD, HelpWidgetConfiguration, ContextMode, ConfiguredDialogWidget
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { SearchProperty } from '../../core/browser';
import { OrganisationSearchContext } from '../../core/browser/organisation';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { ModuleConfigurationService } from '../../services';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return OrganisationSearchContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpSettings = new HelpWidgetConfiguration(
            'organisation-search-dialog-help-widget-config', 'Help Widget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Search_Organisation',
            []
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpSettings);

        const helpWidget = new WidgetConfiguration(
            'organisation-search-dialog-help-widget', 'Help Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Help', [],
            new ConfigurationDefinition('organisation-search-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-textblocks'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpWidget);

        const widget = new WidgetConfiguration(
            'organisation-search-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'search-organisation-dialog', 'Translatable#Organisation Search', [], null, null,
            false, false, 'kix-icon-search-man-house'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), 'Organisation Search Dialog', ConfigurationType.Context,
            this.getModuleId(),
            [
                new ConfiguredWidget(
                    'organisation-search-dialog-help-widget', 'organisation-search-dialog-help-widget', null,
                    [new UIComponentPermission('faq/articles', [CRUD.READ])]
                )
            ],
            [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'organisation-search-dialog-widget', 'organisation-search-dialog-widget',
                    KIXObjectType.ORGANISATION, ContextMode.SEARCH
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {

        const formId = 'organisation-search-form';
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new SearchForm(
                formId, 'Translatable#Organisations', KIXObjectType.ORGANISATION, FormContext.SEARCH, null,
                [SearchProperty.FULLTEXT, OrganisationProperty.NAME, OrganisationProperty.NUMBER]
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.SEARCH], KIXObjectType.ORGANISATION, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
