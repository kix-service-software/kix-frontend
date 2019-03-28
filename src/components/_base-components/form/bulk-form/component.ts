import { WidgetType, KIXObject } from '../../../../core/model';
import {
    WidgetService, TableHeaderHeight,
    TableRowHeight, LabelService, TableConfiguration, BrowserUtil,
    KIXObjectService, TableFactoryService, TableEvent, ContextService, ValueState, ServiceMethod, TableEventData
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { IEventSubscriber, EventService } from '../../../../core/browser/event';
import { BulkDialogContext } from '../../../../core/browser/bulk';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { DialogService } from '../../../../core/browser/components/dialog';

class Component {

    private state: ComponentState;

    private cancelBulkProcess: boolean = false;

    private tableSubscriber: IEventSubscriber;

    private errorObjects: KIXObject[];
    private finishedObjects: KIXObject[];

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.errorObjects = [];
        this.finishedObjects = [];
        WidgetService.getInstance().setWidgetType('bulk-form-group', WidgetType.GROUP);
    }

    public onInput(input: any): void {
        this.state.bulkManager = input.bulkManager;
        this.state.bulkManager.registerListener('bulk-dialog-listener', () => {
            this.state.canRun = this.state.bulkManager.hasDefinedValues() && !!this.state.bulkManager.objects.length;
        });

        this.createTable();
        this.update();
    }

    public async update(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Reset Data", "Translatable#Close Dialog", "Translatable#Execute now!"
        ]);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
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
                    `bulk-form-list-${this.state.bulkManager.objectType}`, this.state.bulkManager.objectType,
                    configuration, null, BulkDialogContext.CONTEXT_ID,
                    true, null, true
                );

                this.prepareTitle();

                this.tableSubscriber = {
                    eventSubscriberId: 'bulk-table-listener',
                    eventPublished: async (data: TableEventData, eventId: string) => {
                        if (data && data.tableId === table.getTableId()) {
                            if (eventId === TableEvent.TABLE_INITIALIZED) {
                                table.selectAll();
                            }
                            if (eventId === TableEvent.TABLE_READY
                                && (!!this.errorObjects.length || !!this.finishedObjects.length)
                            ) {
                                this.state.table.setRowObjectValueState(this.errorObjects, ValueState.HIGHLIGHT_ERROR);
                                this.state.table.setRowObjectValueState(
                                    this.finishedObjects, ValueState.HIGHLIGHT_SUCCESS
                                );
                            }
                            const rows = this.state.table.getSelectedRows();
                            const objects = rows.map((r) => r.getRowObject().getObject());
                            this.state.bulkManager.objects = objects;
                            this.state.canRun = this.state.bulkManager.hasDefinedValues() && !!objects.length;
                            await this.prepareTitle();
                        }
                    }
                };

                EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
                EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
                EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);

                this.state.table = table;
            }
        }
    }

    private async prepareTitle(): Promise<void> {
        const objectName = await LabelService.getInstance().getObjectName(this.state.bulkManager.objectType, true);
        const objectCount = this.state.bulkManager.objects.length;
        this.state.tableTitle = await TranslationService.translate(
            'Selected {0} ({1})', [objectName, objectCount]
        );
    }

    public async run(): Promise<void> {
        this.cancelBulkProcess = false;
        const objectName = await LabelService.getInstance().getObjectName(this.state.bulkManager.objectType, true);

        const objects = this.state.bulkManager.objects;
        const editableValues = this.state.bulkManager.getEditableValues();

        const title = await TranslationService.translate('Translatable#Execute now?');
        const question = await TranslationService.translate(
            'You will edit {0} attributes for {1} {2}. Execute now?',
            [editableValues.length, objects.length, objectName]
        );
        BrowserUtil.openConfirmOverlay(
            title,
            question,
            this.runBulkManager.bind(this)
        );
    }

    private async runBulkManager(): Promise<void> {
        this.state.run = true;

        const objectName = await LabelService.getInstance().getObjectName(this.state.bulkManager.objectType, true);
        const objects = this.state.bulkManager.objects;
        this.state.table.getRows().forEach((r) => r.setValueState(ValueState.NONE));
        this.finishedObjects = [];
        this.errorObjects = [];

        const editText = await TranslationService.translate('Translatable#edited');
        DialogService.getInstance().setMainDialogLoading(
            true, `${this.finishedObjects.length}/${objects.length} ${objectName} ${editText}`,
            false, 0, this.cancelBulk.bind(this)
        );

        const objectTimes: number[] = [];

        for (const object of objects) {

            const start = Date.now();
            let end;
            await this.state.bulkManager.execute(object)
                .then(() => {
                    this.finishedObjects.push(object);
                    this.state.table.selectRowByObject(object, false);
                    this.state.table.setRowObjectValueState([object], ValueState.HIGHLIGHT_SUCCESS);
                })
                .catch(async (error) => {
                    this.errorObjects.push(object);
                    this.state.table.setRowObjectValueState([object], ValueState.HIGHLIGHT_ERROR);
                    const errorText = await TranslationService.translate('Translatable#An error occurred.');
                    DialogService.getInstance().setMainDialogLoading(true, errorText);
                    end = Date.now();
                    await this.handleObjectEditError(
                        object, (this.finishedObjects.length + this.errorObjects.length), objects.length
                    );
                });

            if (this.cancelBulkProcess) {
                break;
            }

            if (!end) {
                end = Date.now();
            }

            await this.setLoadingInformation(objectTimes, start, end, this.finishedObjects.length, objects.length);
        }

        await this.updateTable();

        if (!this.errorObjects.length) {
            const toast = await TranslationService.translate('Translatable#Changes saved.');
            BrowserUtil.openSuccessOverlay(toast);
        }

        DialogService.getInstance().setMainDialogLoading(false);
    }

    private async updateTable(): Promise<void> {
        const context = await ContextService.getInstance().getContext<BulkDialogContext>(BulkDialogContext.CONTEXT_ID);
        const oldObjects = await context.getObjectList();
        const idsToLoad = oldObjects ? oldObjects.map((o) => o.ObjectId) : null;

        const newObjects = await KIXObjectService.loadObjects(
            this.state.bulkManager.objectType, idsToLoad, null, null, false
        );
        context.setObjectList(newObjects);
    }

    private async setLoadingInformation(
        objectTimes: number[], start: number, end: number, finishedCount: number, objectCount: number
    ): Promise<void> {
        const objectName = await LabelService.getInstance().getObjectName(this.state.bulkManager.objectType, true);
        objectTimes.push(end - start);
        const average = BrowserUtil.calculateAverage(objectTimes);
        const time = average * (objectCount - finishedCount);

        const editText = await TranslationService.translate('Translatable#edited');
        DialogService.getInstance().setMainDialogLoading(
            true, `${finishedCount}/${objectCount} ${objectName} ${editText}`, false, time, this.cancelBulk.bind(this)
        );
    }

    private cancelBulk(): void {
        this.cancelBulkProcess = true;
    }

    private handleObjectEditError(object: KIXObject, finishedCount: number, objectCount: number): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const oName = await LabelService.getInstance().getObjectName(this.state.bulkManager.objectType);
            const identifier = await LabelService.getInstance().getText(object);

            const confirmText = await TranslationService.translate(
                'Changes cannot be saved. How do you want to proceed?'
            );

            const cancelButton = await TranslationService.translate('Translatable#Cancel');
            const ignoreButton = await TranslationService.translate('Translatable#Ignore');
            BrowserUtil.openConfirmOverlay(
                `${finishedCount}/${objectCount}`,
                `${oName} ${identifier}: ` + confirmText,
                () => resolve(),
                () => {
                    this.cancelBulkProcess = true;
                    resolve();
                },
                [ignoreButton, cancelButton]
            );
        });
    }
}

module.exports = Component;
