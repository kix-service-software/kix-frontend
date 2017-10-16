import { PersonalSettings } from '@kix/core/dist/model/client';
import { PersonalSettingsComponentState } from './../model/PersonalSettingsComponentState';
import { PersonalSettingsAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class PersonalSettingsActionHandler {

    public handleAction(state: PersonalSettingsComponentState, action): PersonalSettingsComponentState {
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
    state = state || new PersonalSettingsComponentState();

    return actionHandler.handleAction(state, action);
};
