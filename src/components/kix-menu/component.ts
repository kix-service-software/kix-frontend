import { MenuState } from './../../model-client/menu/state/MenuState';
class KIXMenuComponent {

    public state: MenuState;

    public onCreate(input: any): void {
        this.state = new MenuState();
        this.state.menuEntries = input.mainMenuEntries;

        // TODO: just for testing, have to be removed
        this.state.menuEntries.push({ icon: '', link: '#', text: 'Ticket' });
        this.state.menuEntries.push({ icon: '', link: '#', text: 'CMDB' });
        this.state.menuEntriesExtra = [
            { icon: '', link: '#', text: 'Admin' },
            { icon: '', link: '#', text: 'Kalendar' }
        ];
    }

    public onMount(): void {
        console.log("Mount Menu");
    }
}

module.exports = KIXMenuComponent;
