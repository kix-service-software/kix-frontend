import { PersonalSettingsComponentState } from './model/PersonalSettingsComponentState';
import { PersonalSettingsReduxState } from './store/PersonalSettingsReduxState';
import { PERSONAL_SETTINGS_INITIALIZE, SAVE_PERSONAL_SETTINGS } from './store/actions';

class PersonalSettingsContainerComponent {

    public state: PersonalSettingsComponentState;

    private store: any;

    public onCreate(input: any): void {
        this.state = new PersonalSettingsComponentState();
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(PERSONAL_SETTINGS_INITIALIZE(this.store));
    }

    public stateChanged(): void {
        const reduxState: PersonalSettingsReduxState = this.store.getState();
        if (reduxState.personalSettings) {
            this.state.personalSettings = reduxState.personalSettings;
            if (this.state.personalSettings.length) {
                const ps = this.state.personalSettings[0];
                this.showSettings(ps.id);
            }
        }
    }

    public showSettings(id: string): void {
        this.state.currentSetting = this.state.personalSettings.find((ps) => ps.id === id);
    }

    public getSettingsTemplate(): any {
        return require(this.state.currentSetting.templatePath);
    }

    private savePersonalSettings(): any {
        this.store.dispatch(SAVE_PERSONAL_SETTINGS(this.store, this.state.currentSetting));
    }

}

module.exports = PersonalSettingsContainerComponent;
