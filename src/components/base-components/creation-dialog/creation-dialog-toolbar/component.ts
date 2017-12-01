import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

class CreateObjectToolbarComponent {

    public state: any;

    public onCreate(): void {
        this.state = {};
    }

    public openCreateObjectDialog(): void {
        ApplicationStore.getInstance().toggleDialog(require('../creation-dialog-container'));
    }

}

module.exports = CreateObjectToolbarComponent;
