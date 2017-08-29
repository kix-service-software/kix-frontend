import { MenuState } from './../../model-client/menu/state/MenuState';
class KIXMenuComponent {

    public state: MenuState;

    public onCreate(input: any): void {
        this.state = new MenuState();
        this.state.menuEntries = input.mainMenuEntries;
    }

    public onMount(): void {
        console.log("Mount Menu");
    }
}

module.exports = KIXMenuComponent;
