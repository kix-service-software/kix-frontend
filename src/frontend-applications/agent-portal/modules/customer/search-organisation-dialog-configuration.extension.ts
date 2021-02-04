/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { OrganisationSearchContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { HelpWidgetConfiguration } from '../../model/configuration/HelpWidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { SearchForm } from '../../modules/base-components/webapp/core/SearchForm';
import { FormContext } from '../../model/configuration/FormContext';
import { SearchProperty } from '../search/model/SearchProperty';
import { OrganisationProperty } from './model/OrganisationProperty';
import { ModuleConfigurationService } from '../../server/services/configuration';
import { KIXExtension } from '../../../../server/model/KIXExtension';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return OrganisationSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const helpSettings = new HelpWidgetConfiguration(
            'organisation-search-dialog-help-widget-config', 'Help Widget Config', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Search_Organisation',
            []
        );
        configurations.push(helpSettings);

        const helpWidget = new WidgetConfiguration(
            'organisation-search-dialog-help-widget', 'Help Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Help', [],
            new ConfigurationDefinition('organisation-search-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-textblocks'
        );
        configurations.push(helpWidget);

        const widget = new WidgetConfiguration(
            'organisation-search-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'search-organisation-dialog', 'Translatable#Organisation Search', [], null, null,
            false, false, 'kix-icon-search-man-house'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
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
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'organisation-search-form';
        configurations.push(
            new SearchForm(
                formId, 'Translatable#Organisations', KIXObjectType.ORGANISATION, FormContext.SEARCH, null,
                [SearchProperty.FULLTEXT, OrganisationProperty.NAME, OrganisationProperty.NUMBER]
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.SEARCH], KIXObjectType.ORGANISATION, formId);
        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
