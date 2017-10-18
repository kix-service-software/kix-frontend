import { CreationDialogComponentState } from './model/CreationDialogComponentState';
import { CreationDialogReduxState } from './store/CreationDialogReduxState';
import { CREATION_DIALOGS_INITIALIZE } from './store/actions';

class CreationDialogComponent {

    private state: CreationDialogComponentState;

    private store: any;

    public onCreate(input: any): void {
        this.state = new CreationDialogComponentState();
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(CREATION_DIALOGS_INITIALIZE(this.store));
    }

    public stateChanged(): void {
        const reduxState: CreationDialogReduxState = this.store.getState();
        if (reduxState.creationDialogs) {
            this.state.creationDialogs = reduxState.creationDialogs;
            if (this.state.creationDialogs.length) {
                const cd = this.state.creationDialogs[0];
                this.showDialog(cd.id);
            }
        }
    }

    public showDialog(id: string): void {
        this.state.currentDialog = this.state.creationDialogs.find((cd) => cd.id === id);
    }

    public getDialogTemplate(): any {
        return require(this.state.currentDialog.templatePath);
    }

}

module.exports = CreationDialogComponent;
