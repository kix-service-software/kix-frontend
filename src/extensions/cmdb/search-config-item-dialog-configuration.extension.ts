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
    FormContext, SearchForm, ConfiguredWidget, WidgetConfiguration, ConfigItemProperty,
    CRUD, ConfiguredDialogWidget, ContextMode, HelpWidgetConfiguration
} from '../../core/model';
import { ConfigItemSearchContext } from '../../core/browser/cmdb';
import { ConfigurationService } from '../../core/services';
import { SearchProperty } from '../../core/browser';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ConfigItemSearchContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpConfig = new HelpWidgetConfiguration(
            'cmdb-ci-search-dialog-help-widget-config', 'Help COnfig', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Search_ConfigItem',
            []
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpConfig);

        const helpWidget = new WidgetConfiguration(
            'cmdb-ci-search-help-widget', 'Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Help', [],
            new ConfigurationDefinition('cmdb-ci-search-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-query', false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpWidget);

        const dialogWidget = new WidgetConfiguration(
            'cmdb-ci-search-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'search-config-item-dialog', 'Translatable#Config Item Search', [], null, null,
            false, false, 'kix-icon-search-ci'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(dialogWidget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [
                new ConfiguredWidget(
                    'cmdb-ci-search-help-widget', 'cmdb-ci-search-help-widget', null,
                    [new UIComponentPermission('faq/articles', [CRUD.READ])]
                )
            ],
            [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'cmdb-ci-search-dialog-widget', 'cmdb-ci-search-dialog-widget',
                    KIXObjectType.CONFIG_ITEM, ContextMode.SEARCH
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'cmdb-config-item-search-form';
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new SearchForm(
                formId, 'Config Item', KIXObjectType.CONFIG_ITEM, FormContext.SEARCH, null,
                [
                    SearchProperty.FULLTEXT, ConfigItemProperty.CLASS_ID,
                    ConfigItemProperty.NAME, ConfigItemProperty.NUMBER,
                    ConfigItemProperty.CUR_INCI_STATE_ID, ConfigItemProperty.CUR_DEPL_STATE_ID
                ]
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.SEARCH], KIXObjectType.CONFIG_ITEM, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
