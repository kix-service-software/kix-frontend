import { MenuEntry } from '@kix/core/dist/model/client';
import { MainMenuSocketListener } from './../socket/MainMenuSocketListener';

export class MainMenuState {

    public primaryMenuEntries: MenuEntry[] = [];

    public secondaryMenuEntries: MenuEntry[] = [];

    public showText: boolean = false;

    public socketListener: MainMenuSocketListener = null;

}
