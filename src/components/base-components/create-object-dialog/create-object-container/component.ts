import { CreateDialogComponentState } from './model/CreateDialogComponentState';
import { CreateObjectDialogReduxState } from './store/CreateObjectDialogReduxState';
import { DIALOGS_INITIALIZE } from './store/actions';
class CreateObjectDialogComponent {

    private state: CreateDialogComponentState;

    private store: any;

    public onCreate(input: any): void {
        this.state = new CreateDialogComponentState();
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(DIALOGS_INITIALIZE(this.store));
    }

    public stateChanged(): void {
        const reduxState: CreateObjectDialogReduxState = this.store.getState();
        if (reduxState.createDialogs) {
            this.state.createDialogs = reduxState.createDialogs;
            if (this.state.createDialogs.length) {
                const cd = this.state.createDialogs[0];
                this.showDialog(cd.id);
            }
        }
    }

    public showDialog(id: string): void {
        this.state.currentDialog = this.state.createDialogs.find((cd) => cd.id === id);
    }

    public getDialogTemplate(): any {
        return require(this.state.currentDialog.templatePath);
    }

}

module.exports = CreateObjectDialogComponent;
