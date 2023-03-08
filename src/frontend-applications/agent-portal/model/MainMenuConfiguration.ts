/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { MenuEntry } from './MenuEntry';
import { IConfiguration } from './configuration/IConfiguration';
import { ConfigurationType } from './configuration/ConfigurationType';

export class MainMenuConfiguration implements IConfiguration {

    public primaryMenuEntryConfigurations: MenuEntry[];

    public secondaryMenuEntryConfigurations: MenuEntry[];

    public showText: boolean;

    public application: string = 'agent-portal';

    public constructor(
        primaryConfiguration: MenuEntry[],
        secondaryConfiguration: MenuEntry[],
        showText: boolean = false,
        public id: string = 'application-main-menu',
        public name: string = 'Main Menu',
        public type: ConfigurationType = ConfigurationType.MainMenu,
        public valid: boolean = true,
    ) {
        this.primaryMenuEntryConfigurations = primaryConfiguration;
        this.secondaryMenuEntryConfigurations = secondaryConfiguration;
        this.showText = showText;
    }

}
