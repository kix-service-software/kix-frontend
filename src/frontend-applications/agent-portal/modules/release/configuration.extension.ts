/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { ReleaseContext } from './webapp/core/ReleaseContext';
import { SliderWidgetConfiguration } from './model/SliderWidgetConfiguration';
import { SliderContent } from './model/SliderContent';
import { KIXExtension } from '../../../../server/model/KIXExtension';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ReleaseContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
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
        configurations.push(sliderConfig);

        const sliderWidget = new WidgetConfiguration(
            'release-welcome-slider-widget', 'Welcome Slider', ConfigurationType.Widget,
            'welcome-slider-widget', 'Translatable#Welcome to KIX 18', [],
            new ConfigurationDefinition('release-welcome-slider-configuration', ConfigurationType.Slider),
            null, false, true, null, false
        );
        configurations.push(sliderWidget);

        const helpHintsTricks = new WidgetConfiguration(
            'release-welcome-help-hints-widget', 'Hints Widget', ConfigurationType.Widget,
            'help-hints-tricks-widget', 'Translatable#Help, hints & tricks', [], null, null,
            false, true, null, false
        );
        configurations.push(helpHintsTricks);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Welcome Page', ConfigurationType.Context,
                this.getModuleId(),
                [], [], [],
                [
                    new ConfiguredWidget('release-welcome-slider-widget', 'release-welcome-slider-widget'),
                    new ConfiguredWidget('release-welcome-help-hints-widget', 'release-welcome-help-hints-widget')
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
