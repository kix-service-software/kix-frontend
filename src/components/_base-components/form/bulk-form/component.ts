import { WidgetType, KIXObject } from '../../../../core/model';
import {
    WidgetService, DialogService, StandardTableFactoryService, TableHeaderHeight,
    TableRowHeight, LabelService, TableConfiguration, BrowserUtil, TableHighlightLayer,
    ITableHighlightLayer, KIXObjectService, PropertyOperator
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';

class Component {

    private state: ComponentState;

    private cancelBulkProcess: boolean = false;

    private successHighlightLayer: ITableHighlightLayer;
    private errorHighlightLayer: ITableHighlightLayer;

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
                    null, null, null, null, true, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                );

                const table = StandardTableFactoryService.getInstance().createStandardTable(
                    this.state.bulkManager.objectType, configuration, null, null, true, null, true
                );

                table.layerConfiguration.contentLayer.setPreloadedObjects(this.state.bulkManager.objects);

                this.successHighlightLayer = new TableHighlightLayer();
                table.addAdditionalLayerOnTop(this.successHighlightLayer);

                this.errorHighlightLayer = new TableHighlightLayer('error');
                table.addAdditionalLayerOnTop(this.errorHighlightLayer);

                this.successHighlightLayer = new TableHighlightLayer();
                table.addAdditionalLayerOnTop(this.successHighlightLayer);

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
        this.successHighlightLayer.setHighlightedObjects([]);
        this.errorHighlightLayer.setHighlightedObjects([]);

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
                    this.state.table.listenerConfiguration.selectionListener.objectSelectionChanged(object, false);
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

        const finishedIds = finishedObjects.map((o) => o.ObjectId);
        const newObjects = await KIXObjectService.loadObjects(
            this.state.bulkManager.objectType, finishedIds, null, null, false
        );

        this.state.table.layerConfiguration.contentLayer.replaceObjects(newObjects);
        this.successHighlightLayer.setHighlightedObjects(newObjects);
        this.errorHighlightLayer.setHighlightedObjects(errorObjects);
        await this.state.table.loadRows();

        if (!errorObjects.length) {
            BrowserUtil.openSuccessOverlay('Änderungen wurden gespeichert');
        }

        DialogService.getInstance().setMainDialogLoading(false);
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
