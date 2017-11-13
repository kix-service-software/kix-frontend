import { PersonalSettingsReduxState } from './PersonalSettingsReduxState';
import { PersonalSettings } from '@kix/core/dist/model/client';
import { PersonalSettingsAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class PersonalSettingsActionHandler {

    public handleAction(state: PersonalSettingsReduxState, action): PersonalSettingsReduxState {
        switch (action.type) {
            case PersonalSettingsAction.PERSONAL_SETTINGS_INITIALIZE + FULFILLED: {
                state = { ...state, socketListener: action.payload.socketListener };
                break;
            }

            case PersonalSettingsAction.PERSONAL_SETTINGS_LOADED + FULFILLED: {
                state = { ...state, personalSettings: action.payload.personalSettings };
                break;
            }

            case PersonalSettingsAction.SAVE_PERSONAL_SETTINGS + PENDING:
                state = { ...state, saving: true };
                break;

            case PersonalSettingsAction.SAVE_PERSONAL_SETTINGS + FULFILLED:
                state = { ...state, saving: false };
                break;

            default:
                state = { ...state };
        }

        return state;
    }
}

const actionHandler = new PersonalSettingsActionHandler();

export default (state, action) => {
    state = state || new PersonalSettingsReduxState();

    return actionHandler.handleAction(state, action);
};
