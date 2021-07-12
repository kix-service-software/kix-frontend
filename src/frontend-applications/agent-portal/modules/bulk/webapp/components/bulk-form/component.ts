/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { TableEvent, TableFactoryService, TableEventData, ValueState } from '../../../../base-components/webapp/core/table';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { BulkDialogContext } from '../../core';
import { ValidationResult } from '../../../../base-components/webapp/core/ValidationResult';
import { ComponentContent } from '../../../../base-components/webapp/core/ComponentContent';
import { OverlayService } from '../../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../base-components/webapp/core/OverlayType';
import { ValidationSeverity } from '../../../../base-components/webapp/core/ValidationSeverity';

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
    }

    public onInput(input: any): void {
        if (!this.state.bulkManager) {
            this.state.bulkManager = input.bulkManager;
        }
    }

    public async onMount(): Promise<void> {
        this.createTable();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Reset data',
            'Translatable#Execute now', 'Translatable#Attributes to be edited'
        ]);

        this.state.bulkManager?.registerListener('bulk-dialog-listener', async () => {
            const hasDefinedValues = await this.state.bulkManager.hasDefinedValues();
            this.state.canRun = hasDefinedValues && !!this.state.bulkManager.objects.length;
        });
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        TableFactoryService.getInstance().destroyTable(`bulk-form-list-${this.state.bulkManager.objectType}`);
    }

    public async reset(): Promise<void> {
        this.state.bulkManager?.reset();
        const dynamicFormComponent = (this as any).getComponent('bulk-dynamic-form');
        if (dynamicFormComponent) {
            dynamicFormComponent.updateValues();
        }
    }

    public cancel(): void {
        ContextService.getInstance().toggleActiveContext();
    }

    private async createTable(): Promise<void> {
        if (this.state.bulkManager && !this.state.table) {

            if (this.state.bulkManager.objects) {

                const configuration = new TableConfiguration(null, null, null,
                    null, null, null, null, [], true, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                );

                const table = await TableFactoryService.getInstance().createTable(
                    `bulk-form-list-${this.state.bulkManager.objectType}`, this.state.bulkManager.objectType,
                    configuration, null, BulkDialogContext.CONTEXT_ID, true, null, true
                );

                await this.prepareTitle();

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
                            this.state.canRun = await this.state.bulkManager.hasDefinedValues() && !!objects.length;
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
        if (this.state.table) {
            const objectName = await LabelService.getInstance().getObjectName(this.state.bulkManager.objectType, true);
            const objectCount = this.state.table.getRows().length;
            this.state.tableTitle = await TranslationService.translate(
                'Translatable#Selected {0} ({1})', [objectName, objectCount]
            );
        }
    }

    public async run(): Promise<void> {
        this.cancelBulkProcess = false;
        const objectName = await LabelService.getInstance().getObjectName(this.state.bulkManager.objectType, true);

        const validationResult = await this.state.bulkManager.validate();
        if (validationResult.some((r) => r.severity === ValidationSeverity.ERROR)) {
            this.showValidationError(validationResult.filter((r) => r.severity === ValidationSeverity.ERROR));
        } else {

            const objects = this.state.bulkManager.objects;
            const editableValues = await this.state.bulkManager.getEditableValues();

            const title = await TranslationService.translate('Translatable#Execute now?');
            const question = await TranslationService.translate(
                'Translatable#You will edit {0} attributes for {1} {2}. Execute now?',
                [editableValues.length, objects.length, objectName]
            );
            BrowserUtil.openConfirmOverlay(
                title,
                question,
                this.runBulkManager.bind(this)
            );
        }
    }

    protected showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Translatable#Error on form validation:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Translatable#Validation error', null, true
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
        BrowserUtil.toggleLoadingShield(
            'BULK_SHIELD', true, `${this.finishedObjects.length}/${objects.length} ${objectName} ${editText}`,
            0, this.cancelBulk.bind(this)
        );

        const objectTimes: number[] = [];

        for (const object of objects) {

            const start = Date.now();
            let end: number;
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
                    BrowserUtil.toggleLoadingShield('BULK_SHIELD', true, errorText);
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

        BrowserUtil.toggleLoadingShield('BULK_SHIELD', false);
    }

    private async updateTable(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const oldObjects = await context.getObjectList(this.state.bulkManager.objectType);
        const idsToLoad = oldObjects ? oldObjects.map((o) => o.ObjectId) : null;

        const newObjects = await KIXObjectService.loadObjects(
            this.state.bulkManager.objectType, idsToLoad, null, null, false
        );
        context.setObjectList(this.state.bulkManager.objectType, newObjects);
        this.prepareTitle();
    }

    private async setLoadingInformation(
        objectTimes: number[], start: number, end: number, finishedCount: number, objectCount: number
    ): Promise<void> {
        const objectName = await LabelService.getInstance().getObjectName(this.state.bulkManager.objectType, true);
        objectTimes.push(end - start);
        const average = BrowserUtil.calculateAverage(objectTimes);
        const time = average * (objectCount - finishedCount);

        const editText = await TranslationService.translate('Translatable#edited');
        BrowserUtil.toggleLoadingShield(
            'BULK_SHIELD', true, `${finishedCount}/${objectCount} ${objectName} ${editText}`, time,
            this.cancelBulk.bind(this)
        );
    }

    private cancelBulk(): void {
        this.cancelBulkProcess = true;
    }

    private handleObjectEditError(object: KIXObject, finishedCount: number, objectCount: number): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const oName = await LabelService.getInstance().getObjectName(this.state.bulkManager.objectType);
            const identifier = await LabelService.getInstance().getObjectText(object);

            const confirmText = await TranslationService.translate(
                'Translatable#Changes cannot be saved. How do you want to proceed?'
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
                [ignoreButton, cancelButton],
                undefined, undefined, true
            );
        });
    }
}

module.exports = Component;
