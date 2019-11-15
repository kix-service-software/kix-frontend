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
    WidgetConfiguration, ConfiguredWidget, ContextConfiguration, TabWidgetConfiguration,
} from '../../core/model/';
import { TranslationDetailsContext } from '../../core/browser/i18n/admin/context';
import { ConfigurationType, ConfigurationDefinition, IConfiguration } from '../../core/model/configuration';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return TranslationDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const translationInfoWidget = new WidgetConfiguration(
            'i18n-translation-details-info-widget', 'Info Widget', ConfigurationType.Widget,
            'i18n-translation-info-widget', 'Translatable#Pattern Information', [], null, null,
            false, true, null, false
        );
        configurations.push(translationInfoWidget);

        const tabConfig = new TabWidgetConfiguration(
            'i18n-translation-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['i18n-translation-details-info-widget'],
        );
        configurations.push(tabConfig);

        const tabLane = new WidgetConfiguration(
            'i18n-translation-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('i18n-translation-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLane);


        const languagesListWidget = new WidgetConfiguration(
            'i18n-translation-details-language-widget', 'Language Widget', ConfigurationType.Widget,
            'i18n-translation-language-list-widget', 'Translatable#Translations', [],
            null, null, false, true, null, false
        );
        configurations.push(languagesListWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [], [],
                [
                    new ConfiguredWidget('i18n-translation-details-tab-widget', 'i18n-translation-details-tab-widget')
                ],
                [
                    new ConfiguredWidget(
                        'i18n-translation-details-language-widget', 'i18n-translation-details-language-widget'
                    )
                ],
                [
                    'i18n-admin-translation-create'
                ],
                [
                    'i18n-admin-translation-edit', 'print-action'
                ],
                [],
                [
                    new ConfiguredWidget('i18n-translation-details-info-widget', 'i18n-translation-details-info-widget')
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
