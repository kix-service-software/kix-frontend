import { MenuEntry } from "..";

export class MainMenuEntriesResponse {

    public primaryMenuEntries: MenuEntry[];

    public secondaryMenuEntries: MenuEntry[];

    public showText: boolean;

    public constructor(primaryMenuEntries: MenuEntry[], secondaryMenuEntries: MenuEntry[], showText: boolean) {
        this.primaryMenuEntries = primaryMenuEntries;
        this.secondaryMenuEntries = secondaryMenuEntries;
        this.showText = showText;
    }

}
