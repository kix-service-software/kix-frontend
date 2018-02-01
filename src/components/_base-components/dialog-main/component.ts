import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';

export class MainDialogComponent {

    private closeDialog(): void {
        ApplicationStore.getInstance().toggleMainDialog();
    }
}

module.exports = MainDialogComponent;
