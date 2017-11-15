import { WidgetBaseComponent } from '@kix/core/dist/model/client/';

import { NotesComponentState } from './model/NotesComponentState';
import { NotesReduxState } from './store';
import { NOTES_INITIALIZE } from './store/actions';

class NotesWidgetComponent extends WidgetBaseComponent<NotesComponentState, NotesReduxState> {

    private componentInititalized: boolean = false;

    public onCreate(input: any): void {
        this.state = new NotesComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(NOTES_INITIALIZE(this.store, 'notes-widget', this.state.instanceId));
    }

    public stateChanged(): void {
        super.stateChanged();

        const reduxState: NotesReduxState = this.store.getState();

        if (!this.componentInititalized && reduxState.widgetConfiguration) {
            this.componentInititalized = true;
        }
    }

    public showConfigurationClicked(): void {
        this.state.showConfiguration = true;
    }

    public saveConfiguration(): void {
        this.cancelConfiguration();
    }

    public cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    public valueChanged(newValue: string): void {
        const reduxState: NotesReduxState = this.store.getState();
        this.state.widgetConfiguration.settings.notes = newValue;
        reduxState.socketListener.saveWidgetContentConfiguration(this.state.widgetConfiguration);
    }

    public toggleEditMode(): void {
        this.state.editMode = !this.state.editMode;
    }
}

module.exports = NotesWidgetComponent;
