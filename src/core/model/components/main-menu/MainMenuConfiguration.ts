import { MenuEntry } from './MenuEntry';

export class MainMenuConfiguration {

    public primaryMenuEntryConfigurations: MenuEntry[];

    public secondaryMenuEntryConfigurations: MenuEntry[];

    public showText: boolean;

    public constructor(
        primaryConfiguration: MenuEntry[],
        secondaryConfiguration: MenuEntry[],
        showText: boolean = false
    ) {
        this.primaryMenuEntryConfigurations = primaryConfiguration;
        this.secondaryMenuEntryConfigurations = secondaryConfiguration;
        this.showText = showText;
    }

}
