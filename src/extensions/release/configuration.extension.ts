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
import { ReleaseContext, SliderContent, SliderWidgetSettings } from '../../core/browser/release';

export class DashboardModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ReleaseContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const welcomeSlider = new ConfiguredWidget(
            'welcome-slider-widget',
            new WidgetConfiguration(
                'welcome-slider-widget', 'Translatable#Welcome to KIX 18', [], new SliderWidgetSettings(
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
                ),
                false, true, null, false
            )
        );

        const helpHintsTricks = new ConfiguredWidget(
            'help-hints-tricks-widget',
            new WidgetConfiguration(
                'help-hints-tricks-widget', 'Translatable#Help, hints & tricks', [], null,
                false, true, null, false
            )
        );

        const content: string[] = ['welcome-slider-widget', 'help-hints-tricks-widget'];
        const contentWidgets = [welcomeSlider, helpHintsTricks];

        return new ContextConfiguration(
            this.getModuleId(),
            [], [],
            [], [],
            [], [],
            content, contentWidgets
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
