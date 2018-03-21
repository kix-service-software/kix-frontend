import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';

export class MainDialogComponent {

    private closeDialog(): void {
        ApplicationService.getInstance().toggleMainDialog();
    }
}

module.exports = MainDialogComponent;
