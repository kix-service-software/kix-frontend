import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

class CreateObjectToolbarComponent {

    public state: any;

    public onCreate(): void {
        this.state = {};
    }

    public openCreateObjectDialog(): void {
        ApplicationService.getInstance().toggleMainDialog('dialog-creation-container');
    }

}

module.exports = CreateObjectToolbarComponent;
