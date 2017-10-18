import { PersonalSettingsReduxState } from './PersonalSettingsReduxState';
import { PersonalSettings } from '@kix/core/dist/model/client';
import { PersonalSettingsAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class PersonalSettingsActionHandler {

    public handleAction(state: PersonalSettingsReduxState, action): PersonalSettingsReduxState {
        switch (action.type) {
            case PersonalSettingsAction.PERSONAL_SETTINGS_INITIALIZE + FULFILLED: {
                return { ...state, socketListener: action.payload.socketListener };
            }

            case PersonalSettingsAction.PERSONAL_SETTINGS_LOADED + FULFILLED: {
                return { ...state, personalSettings: action.payload.personalSettings };
            }

            default:
                return { ...state };
        }
    }
}

const actionHandler = new PersonalSettingsActionHandler();

export default (state, action) => {
    state = state || new PersonalSettingsReduxState();

    return actionHandler.handleAction(state, action);
};
