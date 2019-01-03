import { AbstractAction } from '../../model/components/action/AbstractAction';

export class BulkAction extends AbstractAction {

    public initAction(): void {
        this.text = "Sammelaktion";
        this.icon = "kix-icon-arrow-collect";
    }

    public canRun(): boolean {
        let canRun: boolean = false;
        if (this.data) {
            if (Array.isArray(this.data)) {
                canRun = !!this.data.length;
            } else {
                if (this.data.tableConfiguration.enableSelection && this.data.listenerConfiguration.selectionListener) {
                    const selectedObjects = this.data.listenerConfiguration.selectionListener.getSelectedObjects();
                    canRun = selectedObjects && !!selectedObjects.length;
                }
            }
        }
        return canRun;
    }

}
