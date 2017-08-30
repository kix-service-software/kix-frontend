import { MenuState } from './../../model-client/menu/state/MenuState';
import { MenuComponentState } from './../../model-client/menu/state/MenuComponentState';
import { MAIN_MENU_CONNECT } from '../../model-client/store/actions';

class KIXMenuComponent {

    public state: MenuComponentState;

    public store: any;

    public frontendSocketUrl: string;

    public onCreate(input: any): void {
        this.state = new MenuComponentState();
        this.frontendSocketUrl = input.frontendSocketUrl;
    }

    public onMount(): void {
        this.store = require('../../model-client/store');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(MAIN_MENU_CONNECT(this.frontendSocketUrl));
    }

    public stateChanged(): void {
        const reduxState: MenuState = this.store.getState().mainMenu;
        this.state.menuEntries = reduxState.menuEntries;
    }
}

module.exports = KIXMenuComponent;
