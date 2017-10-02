import { LoginState } from './LoginState';
import { LoginAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class LoginActionHandler {

    public handleLoginAction(state: LoginState, action): LoginState {

        switch (action.type) {
            case LoginAction.LOGIN_INITIALIZE + FULFILLED:
                return { ...state, socketListener: action.payload.loginSocketListener };

            case LoginAction.LOGIN_ERROR + FULFILLED:
                return { ...state, error: action.payload.error, doLogin: false };

            case LoginAction.LOGIN_USERNAME_CHANGED + FULFILLED:
                return { ...state, userName: action.payload.userName };

            case LoginAction.LOGIN_PASSWORD_CHANGED + FULFILLED:
                return { ...state, password: action.payload.password };

            case LoginAction.LOGIN_VALIDATE + FULFILLED:
                return { ...state, valid: action.payload.valid, error: action.payload.error };

            case LoginAction.LOGIN_AUTH + FULFILLED:
                return { ...state, doLogin: true };

            case LoginAction.TRANSLATIONS_LOADED + FULFILLED:
                return { ...state, translations: action.payload.translations };

            default:
                return { ...state };
        }
    }
}

const loginActionHandler = new LoginActionHandler();

export default (state, action) => {
    state = state || new LoginState();

    return loginActionHandler.handleLoginAction(state, action);
};
