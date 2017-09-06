import { MenuEntry } from './../../../model/client/components/main-menu/MenuEntry';
import { MainMenuSocketListener } from './../socket/MainMenuSocketListener';

export class MainMenuState {

    public menuEntries: MenuEntry[] = [];
    public socketListener: MainMenuSocketListener = null;

}
