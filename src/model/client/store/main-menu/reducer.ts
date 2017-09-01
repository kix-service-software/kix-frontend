import { MainMenuState } from './MainMenuState';
import { MainMenuAction } from './actions';

const PENDING = '_PENDING';
const FULFILLED = '_FULFILLED';

class MainMenuActionHandler {

    public handleLoginAction(state: MainMenuState, action): MainMenuState {
        switch (action.type) {
            case MainMenuAction.MAIN_MENU_INITIALIZE + FULFILLED: {
                return { ...state, socketListener: action.payload.mainMenuSocketListener };
            }

            case MainMenuAction.MAIN_MENU_ENTRIES_LOADED + FULFILLED: {
                return { ...state, menuEntries: action.payload.menuEntries };
            }

            default:
                return { ...state };
        }
    }
}

const mainMenuActionHandler = new MainMenuActionHandler();

export default (state, action) => {
    state = state || new MainMenuState();

    return mainMenuActionHandler.handleLoginAction(state, action);
};
