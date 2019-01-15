import { WidgetType, KIXObject } from '../../../../core/model';
import {
    WidgetService, DialogService, StandardTableFactoryService, TableHeaderHeight,
    TableRowHeight, LabelService, TableListenerConfiguration, ITableSelectionListener, TableConfiguration
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        WidgetService.getInstance().setWidgetType('bulk-form-group', WidgetType.GROUP);
    }

    public onInput(input: any): void {
        this.state.bulkManager = input.bulkManager;
        this.createTable();
    }

    public async reset(): Promise<void> {
        this.state.bulkManager.reset();
        const component = (this as any).getComponent('bulk-value-container');
        if (component) {
            component.reset();
        }
    }

    public cancel(): void {
        this.reset();
        DialogService.getInstance().closeMainDialog();
    }

    public submit(): void {
        // Bulkmanager.run()
    }

    private async createTable(): Promise<void> {
        if (this.state.bulkManager) {

            if (this.state.bulkManager.objects) {

                const configuration = new TableConfiguration(
                    null, null, null, null, true, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                );

                const table = StandardTableFactoryService.getInstance().createStandardTable(
                    this.state.bulkManager.objectType, configuration, null, null, true, null, true
                );

                table.layerConfiguration.contentLayer.setPreloadedObjects(this.state.bulkManager.objects);

                this.setTitle();
                await table.loadRows();

                table.listenerConfiguration.selectionListener.selectAll(
                    table.getTableRows(true)
                );

                table.listenerConfiguration.selectionListener.addListener((objects: KIXObject[]) => {
                    this.state.bulkManager.objects = objects;
                    this.setTitle();
                });

                this.state.table = table;
            }
        }
    }

    private setTitle(): void {
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.state.bulkManager.objectType);
        const objectName = labelProvider.getObjectName(true);
        const objectCount = this.state.bulkManager.objects.length;
        this.state.tableTitle = `Ausgewählte ${objectName} (${objectCount})`;
    }
}

module.exports = Component;
