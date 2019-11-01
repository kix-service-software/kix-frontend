/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from "../../core/extensions";
import { FAQCategoryDetailsContext } from "../../core/browser/faq/admin";
import { ContextConfiguration, ConfiguredWidget, WidgetConfiguration, TabWidgetConfiguration } from "../../core/model";
import { ConfigurationType, ConfigurationDefinition } from "../../core/model/configuration";
import { ModuleConfigurationService } from "../../services";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQCategoryDetailsContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const faqInfoLane = new WidgetConfiguration(
            'faq-category-details-info-widget', 'Info Widget', ConfigurationType.Widget,
            'faq-category-info-widget', 'Translatable#FAQ Category Information',
            [], null, null, false, true, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(faqInfoLane);

        const tabConfig = new TabWidgetConfiguration(
            'faq-category-details-tab-widget-config', 'Tab Widget Config', ConfigurationType.TabWidget,
            ['faq-category-details-info-widget']
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabConfig);

        const tabLane = new WidgetConfiguration(
            'faq-category-details-tab-widget', 'Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('faq-category-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(tabLane);

        return new ContextConfiguration(
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
                'faq-admin-category-edit-action', 'print-action'
            ],
            [],
            [
                new ConfiguredWidget('faq-category-details-info-widget', 'faq-category-details-info-widget')
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
