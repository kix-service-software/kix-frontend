import { MenuComponentState } from './model/MenuComponentState';
import { MainMenuState } from './store/';
import { MAIN_MENU_INITIALIZE } from './store/actions';

class KIXMenuComponent {

    public state: MenuComponentState;
    public store: any;

    public onCreate(input: any): void {
        this.state = new MenuComponentState();
    }

    public onMount(): void {
        this.store = require('./store');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(MAIN_MENU_INITIALIZE());
    }

    public stateChanged(): void {
        const reduxState: MainMenuState = this.store.getState();
        if (reduxState.menuEntries) {
            this.state.menuEntries = reduxState.menuEntries;
        }
    }
}

module.exports = KIXMenuComponent;
