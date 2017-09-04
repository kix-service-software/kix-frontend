import { MainMenuSocketListener } from './../../socket/main-menu/';
import { MenuEntry } from './../../components/main-menu/MenuEntry';

export class MainMenuState {

    public menuEntries: MenuEntry[] = [];
    public socketListener: MainMenuSocketListener = null;

}
