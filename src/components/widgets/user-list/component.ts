import { UserListState } from './store/UserListState';
import { USER_LIST_INITIALIZE } from './store/actions';

class UserListWidgetComponent {

    public state: any;

    private store: any;

    private frontendSocketUrl: string;

    public onCreate(input: any): void {
        this.state = {
            columns: [
                "alle",
                "Firstname",
                "Lastname",
                "Email"
            ],
            values: []
        };
        this.frontendSocketUrl = input.frontendSocketUrl;
    }

    public onMount(): void {
        this.store = require('./store');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(USER_LIST_INITIALIZE(this.frontendSocketUrl));
    }

    public stateChanged(): void {
        const reduxState: UserListState = this.store.getState();
        // this.state.menuEntries = reduxState.menuEntries;
    }
}

module.exports = UserListWidgetComponent;
