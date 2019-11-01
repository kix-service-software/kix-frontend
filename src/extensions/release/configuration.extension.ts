/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { ContextConfiguration, ConfiguredWidget, WidgetConfiguration } from '../../core/model';
import { ReleaseContext, SliderContent, SliderWidgetConfiguration } from '../../core/browser/release';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class DashboardModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ReleaseContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const sliderConfig = new SliderWidgetConfiguration(
            'release-welcome-slider-configuration', 'Slider Configuration', ConfigurationType.Slider,
            [
                new SliderContent(
                    'Translatable#Personal Home Dashboard',
                    'Translatable#QuickstartGuide_Text_Personal_Home_Dashboard',
                    '02-Dashboard.png'
                ),
                new SliderContent(
                    'Translatable#Menu',
                    'Translatable#QuickstartGuide_Text_Menu',
                    '03-Menue.png'
                ),
                new SliderContent(
                    'Translatable#Explorer',
                    'Translatable#QuickstartGuide_Text_Explorer',
                    '04-Explorer.png'
                ),
                new SliderContent(
                    'Translatable#Tables',
                    'Translatable#QuickstartGuide_Text_Tables',
                    '05-Tabellen.png'
                ),
                new SliderContent(
                    'Translatable#Lanes',
                    'Translatable#QuickstartGuide_Text_Lanes',
                    '06-Lanes.png'
                ),
                new SliderContent(
                    'Translatable#Sidebars',
                    'Translatable#QuickstartGuide_Text_Sidebars',
                    '07-Sidebars.png'
                ),
                new SliderContent(
                    'Translatable#Personal Settings',
                    'Translatable#QuickstartGuide_Text_Personal_Settings',
                    '08-Persoenlich.png'
                )
            ]
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(sliderConfig);

        const sliderWidget = new WidgetConfiguration(
            'release-welcome-slider-widget', 'Welcome Slider', ConfigurationType.Widget,
            'welcome-slider-widget', 'Translatable#Welcome to KIX 18', [],
            new ConfigurationDefinition('release-welcome-slider-configuration', ConfigurationType.Slider),
            null, false, true, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(sliderWidget);

        const helpHintsTricks = new WidgetConfiguration(
            'release-welcome-help-hints-widget', 'Hints Widget', ConfigurationType.Widget,
            'help-hints-tricks-widget', 'Translatable#Help, hints & tricks', [], null, null,
            false, true, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpHintsTricks);

        return new ContextConfiguration(
            this.getModuleId(), 'Welcome Page', ConfigurationType.Context,
            this.getModuleId(),
            [], [], [],
            [
                new ConfiguredWidget('release-welcome-slider-widget', 'release-welcome-slider-widget'),
                new ConfiguredWidget('release-welcome-help-hints-widget', 'release-welcome-help-hints-widget')
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
