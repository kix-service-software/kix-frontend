import { PersonalSettingsComponentState } from './model/PersonalSettingsComponentState';
import { PersonalSettingsReduxState } from './store/PersonalSettingsReduxState';
import { PERSONAL_SETTINGS_INITIALIZE } from './store/actions';

class PersonalSettingsContainerComponent {

    public state: PersonalSettingsComponentState;

    private store: any;

    public onCreate(input: any): void {
        this.state = new PersonalSettingsComponentState();
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(PERSONAL_SETTINGS_INITIALIZE());
    }

    public stateChanged(): void {
        const reduxState: PersonalSettingsReduxState = this.store.getState();
        if (reduxState.personalSettings) {
            this.state.personalSettings = reduxState.personalSettings;
        }
    }

}

module.exports = PersonalSettingsContainerComponent;
