import { LoginState } from './../../authentication/state/LoginState';

export default (state, action) => {
    state = state || new LoginState();

    return ActionHandler.handleAction(state, action);
};

class ActionHandler {

    public static handleAction(state: LoginState, action): any {

        switch (action.type) {
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

            default:
                return {
                    ...state
                };
        }
    }
}
