import { MenuComponentState } from './model/MenuComponentState';
import { MainMenuState } from './store/';
import { MAIN_MENU_INITIALIZE } from './store/actions';

class KIXMenuComponent {

    public state: MenuComponentState;
    public store: any;
    public frontendSocketUrl: string;

    public onCreate(input: any): void {
        this.state = new MenuComponentState();
        this.frontendSocketUrl = input.frontendSocketUrl;
    }

    public onMount(): void {
        this.store = require('./store');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(MAIN_MENU_INITIALIZE(this.frontendSocketUrl));
    }

    public stateChanged(): void {
        const reduxState: MainMenuState = this.store.getState();
        this.state.menuEntries = reduxState.menuEntries;
    }
}

module.exports = KIXMenuComponent;
