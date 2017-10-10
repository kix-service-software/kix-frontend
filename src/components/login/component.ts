import { LoginComponentState } from './model/LoginComponentState';
import { LoginTranslationId } from './model/LoginTranslationId';
import { LoginState } from './store/LoginState';
import { TranslationHandler, ClientStorageHandler } from '@kix/core/dist/model/client';
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

    public translationIds: any;


    public onCreate(input: any): void {
        this.state = new LoginComponentState();
        this.frontendUrl = input.frontendUrl;
        this.translationIds = LoginTranslationId;
        this.state.logout = input.logout;
    }

    public stateChanged(): void {
        const reduxState: LoginState = this.store.getState();
        this.state.userName = reduxState.userName;
        this.state.password = reduxState.password;
        this.state.valid = reduxState.valid;
        this.state.error = reduxState.error;
        this.state.doLogin = reduxState.doLogin;
    }

    public async onMount(): Promise<void> {
        this.store = require('./store/');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(LOGIN_INITIALIZE());

        const translationHandler = await TranslationHandler.getInstance();
        this.state.translations = await translationHandler.getTranslations([
            LoginTranslationId.BUTTON_LABEL,
            LoginTranslationId.PASSWORD,
            LoginTranslationId.USERNAME,
            LoginTranslationId.TITLE,
            LoginTranslationId.LOGOUT
        ]);

        if (this.state.logout) {
            ClientStorageHandler.destroyToken();
        }
    }

    public userNameChanged(event: any): void {
        this.store.dispatch(LOGIN_USERNAME_CHANGED(event.target.value));
    }

    public passwordChanged(event: any): void {
        this.store.dispatch(LOGIN_PASSWORD_CHANGED(event.target.value));
    }

    public login(event: any): void {
        this.store.dispatch(LOGIN_VALIDATE(this.state.userName, this.state.password)).then(() => {
            if (this.state.valid) {
                this.store.dispatch(LOGIN_AUTH(this.state.userName, this.state.password));
            }
        });
    }

    public getTranslation(id: LoginTranslationId): string {
        if (this.state.translations[id]) {
            return this.state.translations[id];
        }

        return id;
    }
}

module.exports = LoginFormComponent;
