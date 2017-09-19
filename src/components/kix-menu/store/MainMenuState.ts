import { MenuEntry } from '@kix/core';
import { MainMenuSocketListener } from './../socket/MainMenuSocketListener';

export class MainMenuState {

    public menuEntries: MenuEntry[] = [];
    public socketListener: MainMenuSocketListener = null;

}
