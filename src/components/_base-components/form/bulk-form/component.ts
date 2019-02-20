import { WidgetType, KIXObject, KIXObjectCache } from '../../../../core/model';
import {
    WidgetService, DialogService, TableHeaderHeight,
    TableRowHeight, LabelService, TableConfiguration, BrowserUtil,
    KIXObjectService, TableFactoryService, TableEvent, ContextService, ValueState, ServiceMethod, TableEventData
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { IEventSubscriber, EventService } from '../../../../core/browser/event';
import { BulkDialogContext } from '../../../../core/browser/bulk';
import { finished } from 'stream';

class Component {

    private state: ComponentState;

    private cancelBulkProcess: boolean = false;

    private tableSubscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        WidgetService.getInstance().setWidgetType('bulk-form-group', WidgetType.GROUP);
    }

    public onInput(input: any): void {
        this.state.bulkManager = input.bulkManager;
        this.state.bulkManager.registerListener('bulk-dialog-listener', () => {
            this.state.canRun = this.state.bulkManager.hasDefinedValues();
        });
        this.createTable();
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
    }

    public async reset(): Promise<void> {
        this.state.bulkManager.reset();
        const component = (this as any).getComponent('bulk-value-container');
        if (component) {
            component.reset();
        }
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public submit(): void {
        if (this.state.run) {
            DialogService.getInstance().submitMainDialog();
        }
    }

    private async createTable(): Promise<void> {
        if (this.state.bulkManager) {

            if (this.state.bulkManager.objects) {

                const configuration = new TableConfiguration(
                    null, null, null, null, null, true, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                );

                const table = TableFactoryService.getInstance().createTable(
                    this.state.bulkManager.objectType, configuration, null, BulkDialogContext.CONTEXT_ID,
                    true, null, true
                );

                this.prepareTitle();

                this.tableSubscriber = {
                    eventSubscriberId: 'bulk-table-listener',
                    eventPublished: (data: TableEventData, eventId: string) => {
                        if (data && data.tableId === table.getTableId()) {
                            if (eventId === TableEvent.TABLE_INITIALIZED) {
                                table.selectAll();
                            }
                            const rows = this.state.table.getSelectedRows();
                            const objects = rows.map((r) => r.getRowObject().getObject());
                            this.state.bulkManager.objects = objects;
                            this.prepareTitle();
                        }
                    }
                };

                EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
                EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);

                this.state.table = table;
            }
        }
    }

    private prepareTitle(): void {
        const objectName = LabelService.getInstance().getObjectName(this.state.bulkManager.objectType, true);
        const objectCount = this.state.bulkManager.objects.length;
        this.state.tableTitle = `Ausgewählte ${objectName} (${objectCount})`;
    }

    public run(): void {
        this.cancelBulkProcess = false;
        const objectName = LabelService.getInstance().getObjectName(this.state.bulkManager.objectType, true);

        const objects = this.state.bulkManager.objects;
        const editableValues = this.state.bulkManager.getEditableValues();

        BrowserUtil.openConfirmOverlay(
            'Jetzt ausführen?',
            `Sie ändern ${editableValues.length} Attribute an ${objects.length} ${objectName}. Jetzt starten?`,
            this.runBulkManager.bind(this)
        );
    }

    private async runBulkManager(): Promise<void> {
        this.state.run = true;

        const objectName = LabelService.getInstance().getObjectName(this.state.bulkManager.objectType, true);
        const objects = this.state.bulkManager.objects;
        const finishedObjects: KIXObject[] = [];
        const errorObjects: KIXObject[] = [];

        DialogService.getInstance().setMainDialogLoading(
            true, `${finishedObjects.length}/${objects.length} ${objectName} bearbeitet`, false,
            0, this.cancelBulk.bind(this)
        );

        const objectTimes: number[] = [];

        for (const object of objects) {

            const start = Date.now();
            await this.state.bulkManager.execute(object)
                .then(() => {
                    finishedObjects.push(object);
                    this.state.table.selectRowByObject(object, false);
                })
                .catch(async (error) => {
                    errorObjects.push(object);
                    DialogService.getInstance().setMainDialogLoading(true, 'Es ist ein Fehler aufgetreten.');
                    await this.handleObjectEditError(
                        object, (finishedObjects.length + errorObjects.length), objects.length
                    );
                });

            if (this.cancelBulkProcess) {
                break;
            }

            const end = Date.now();

            this.setLoadingInformation(objectTimes, start, end, finishedObjects.length, objects.length);
        }

        await this.updateTable(errorObjects);

        if (!errorObjects.length) {
            BrowserUtil.openSuccessOverlay('Änderungen wurden gespeichert');
        }

        this.state.table.setRowObjectValueState(errorObjects, ValueState.HIGHLIGHT_ERROR);
        this.state.table.setRowObjectValueState(finishedObjects, ValueState.HIGHLIGHT_SUCCESS);

        DialogService.getInstance().setMainDialogLoading(false);
    }

    private async updateTable(errorObjects: KIXObject[]): Promise<void> {
        const context = await ContextService.getInstance().getContext<BulkDialogContext>(BulkDialogContext.CONTEXT_ID);
        const oldObjects = await context.getObjectList();
        const idsToLoad = oldObjects ? oldObjects.map((o) => o.ObjectId) : null;

        const newObjects = await KIXObjectService.loadObjects(
            this.state.bulkManager.objectType, idsToLoad, null, null, false
        );
        context.setObjectList(newObjects);

        errorObjects.forEach((o) => this.state.table.selectRowByObject(o));
    }

    private setLoadingInformation(
        objectTimes: number[], start: number, end: number, finishedCount: number, objectCount: number
    ): void {
        const objectName = LabelService.getInstance().getObjectName(this.state.bulkManager.objectType, true);
        objectTimes.push(end - start);
        const average = BrowserUtil.calculateAverage(objectTimes);
        const time = average * (objectCount - finishedCount);

        DialogService.getInstance().setMainDialogLoading(
            true, `${finishedCount}/${objectCount} ${objectName} bearbeitet`, false,
            time, this.cancelBulk.bind(this)
        );
    }

    private cancelBulk(): void {
        this.cancelBulkProcess = true;
    }

    private handleObjectEditError(object: KIXObject, finishedCount: number, objectCount: number): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const oName = LabelService.getInstance().getObjectName(this.state.bulkManager.objectType);
            const identifier = await LabelService.getInstance().getText(object);
            // tslint:disable-next-line:max-line-length
            const confirmText = `${oName} ${identifier}: Änderung kann nicht gespeichert werden. Wie möchten Sie weiter verfahren?`;
            BrowserUtil.openConfirmOverlay(
                `${finishedCount}/${objectCount}`,
                confirmText,
                () => resolve(),
                () => {
                    this.cancelBulkProcess = true;
                    resolve();
                },
                ['Ignorieren', 'Abbrechen']
            );
        });
    }
}

module.exports = Component;
