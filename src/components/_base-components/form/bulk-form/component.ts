import { WidgetType } from '../../../../core/model';
import {
    WidgetService, DialogService, StandardTableFactoryService, TableHeaderHeight, TableRowHeight
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { BulkManager } from '../../../../core/browser/bulk';

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
        if (this.state.bulkManager && this.state.bulkManager.objects) {
            const table = StandardTableFactoryService.getInstance().createStandardTable(
                this.state.bulkManager.objectType, null, null, null, true, null, true
            );
            table.tableConfiguration.rowHeight = TableRowHeight.SMALL;
            table.tableConfiguration.headerHeight = TableHeaderHeight.SMALL;

            table.layerConfiguration.contentLayer.setPreloadedObjects(this.state.bulkManager.objects);
            this.state.objectCount = this.state.bulkManager.objects.length;
            await table.loadRows();
            this.state.table = table;
        }
    }
}

module.exports = Component;
