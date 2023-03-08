/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FAQCategoryDetailsContext } from './webapp/core/admin';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { TabWidgetConfiguration } from '../../model/configuration/TabWidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQCategoryDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const faqInfoLane = new WidgetConfiguration(
            'faq-category-details-info-widget', 'Info Widget', ConfigurationType.Widget,
            'faq-category-info-widget', 'Translatable#FAQ Category Information',
            [], null, null, false, true, null, false
        );
        configurations.push(faqInfoLane);

        const tabConfig = new TabWidgetConfiguration(
            'faq-category-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['faq-category-details-info-widget']
        );
        configurations.push(tabConfig);

        const tabLane = new WidgetConfiguration(
            'faq-category-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('faq-category-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabLane);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(),
                [], [],
                [
                    new ConfiguredWidget('faq-category-details-tab-widget', 'faq-category-details-tab-widget')
                ],
                [],
                [
                    'faq-admin-category-create-action'
                ],
                [
                    'faq-admin-category-edit-action'
                ],
                [],
                [
                    new ConfiguredWidget('faq-category-details-info-widget', 'faq-category-details-info-widget')
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
