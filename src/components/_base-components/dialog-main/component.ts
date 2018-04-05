import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { DialogMainComponentState } from './DialogMainComponentState';
import { ComponentsService } from '@kix/core/dist/browser/components';

export class MainDialogComponent {

    private state: DialogMainComponentState;

    public onCreate(): void {
        this.state = new DialogMainComponentState();
    }

    public onMount(): void {
        ApplicationService.getInstance().addServiceListener(this.applicationStateChanged.bind(this));
    }

    private async  applicationStateChanged(): Promise<void> {
        if (this.state.showMainDialog) {
            const currentMainDialog = ApplicationService.getInstance().getCurrentMainDialog();
            if (currentMainDialog[0]) {
                this.state.dialogTemplate =
                    await ComponentsService.getInstance().getComponentTemplate(currentMainDialog[0]);
                this.state.dialogInput = currentMainDialog[1];
                this.state.show = ApplicationService.getInstance().isShowMainDialog();
            }
        }
    }

    private closeDialog(): void {
        ApplicationService.getInstance().toggleMainDialog();
    }
}

module.exports = MainDialogComponent;
