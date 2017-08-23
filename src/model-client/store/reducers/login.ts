import {
    LoginState
} from './../../authentication/';

class LoginActionHandler {

    private socket: SocketIO.Server;

    public handleLoginAction(state: LoginState, action): LoginState {

        switch (action.type) {
            case 'LOGIN_ERROR_FULFILLED':
                return {
                    ...state,
                    error: action.payload.error,
                    doLogin: false
                };

            case 'LOGIN_USERNAME_CHANGED_FULFILLED':
                return {
                    ...state,
                    userName: action.payload.userName
                };

            case 'LOGIN_PASSWORD_CHANGED_FULFILLED':
                return {
                    ...state,
                    password: action.payload.password
                };

            case 'LOGIN_VALIDATE_FULFILLED':
                return {
                    ...state,
                    valid: action.payload.valid
                };

            case 'LOGIN_CONNECT_FULFILLED':
                return {
                    ...state,
                    socket: action.payload.socket
                };

            case 'LOGIN_AUTH_FULFILLED':
                return {
                    ...state,
                    doLogin: action.payload.doLogin
                };

            default:
                return {
                    ...state
                };
        }
    }
}

const loginActionHandler = new LoginActionHandler();

export default (state, action) => {
    state = state || new LoginState();

    return loginActionHandler.handleLoginAction(state, action);
};
