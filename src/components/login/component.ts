import { LoginComponentState } from './model/LoginComponentState';
import { LoginState } from './store/LoginState';
import {
    LOGIN_USERNAME_CHANGED,
    LOGIN_PASSWORD_CHANGED,
    LOGIN_VALIDATE,
    LOGIN_INITIALIZE,
    LOGIN_AUTH
} from './store/actions';


class LoginFormComponent {

    public state: LoginComponentState;

    public store;

    public frontendUrl: string;

    public onCreate(input: any): void {
        this.state = new LoginComponentState();
        this.frontendUrl = input.frontendUrl;
    }

    public stateChanged(): void {
        const reduxState: LoginState = this.store.getState();
        this.state.userName = reduxState.userName;
        this.state.password = reduxState.password;
        this.state.valid = reduxState.valid;
        this.state.error = reduxState.error;
        this.state.doLogin = reduxState.doLogin;
    }

    public onMount(): void {
        this.store = require('./store/');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(LOGIN_INITIALIZE());
    }

    public userNameChanged(event: any): void {
        this.store.dispatch(LOGIN_USERNAME_CHANGED(event.target.value)).then(() => {
            this.store.dispatch(LOGIN_VALIDATE(this.state.userName, this.state.password));
        });
    }

    public passwordChanged(event: any): void {
        this.store.dispatch(LOGIN_PASSWORD_CHANGED(event.target.value)).then(() => {
            this.store.dispatch(LOGIN_VALIDATE(this.state.userName, this.state.password));
        });
    }

    public login(): void {
        if (this.state.valid) {
            this.store.dispatch(LOGIN_AUTH(this.state.userName, this.state.password));
        }
    }
}

module.exports = LoginFormComponent;
