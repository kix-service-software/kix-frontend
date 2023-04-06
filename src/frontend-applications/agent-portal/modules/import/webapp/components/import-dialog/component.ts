/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ImportService } from '../../core';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { Error } from '../../../../../../../server/model/Error';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { Context } from '../../../../../model/Context';
import { TableEvent } from '../../../../table/model/TableEvent';
import { TableEventData } from '../../../../table/model/TableEventData';
import { ValueState } from '../../../../table/model/ValueState';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { ImportConfig } from '../../../model/ImportConfig';
import { ImportRunner } from '../../core/ImportRunner';
import { ImportProperty } from '../../../model/ImportProperty';
import { ComponentContent } from '../../../../base-components/webapp/core/ComponentContent';
import { OverlayService } from '../../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../base-components/webapp/core/OverlayType';

class Component {

    private state: ComponentState;
    private context: Context;
    private objectType: KIXObjectType | string;
    private tableSubscriber: IEventSubscriber;

    private cancelImportProcess: boolean;
    private errorObjects: KIXObject[];
    private finishedObjects: KIXObject[];

    private importFormTimeout;
    private formSubscriber: IEventSubscriber;

    private importRunner: ImportRunner;

    public onCreate(): void {
        this.state = new ComponentState();
        WidgetService.getInstance().setWidgetType('dynamic-form-field-group', WidgetType.GROUP);
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Replace Values', 'Translatable#Start Import'
        ]);

        this.context = ContextService.getInstance().getActiveContext();

        this.state.title = await this.context?.getDisplayText();
        this.objectType = this.context?.descriptor?.kixObjectTypes?.length
            ? this.context?.descriptor?.kixObjectTypes[0]
            : null;

        this.importRunner = ImportService.getInstance().getImportRunner(this.objectType);

        const importManager = ImportService.getInstance().getImportManager(this.objectType);
        importManager.reset(false);
        this.state.importManager = importManager;

        this.formSubscriber = {
            eventSubscriberId: 'ImportDialog',
            eventPublished: (data: FormValuesChangedEventData, eventId: string): void => {
                if (this.importFormTimeout) {
                    clearTimeout(this.importFormTimeout);
                }
                this.loadCSV();
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);

        await this.context?.getFormManager().setFormId(ImportConfig.FORM_ID);
        this.state.prepared = true;

        this.registerTableListener();
        this.createTable();
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
    }

    private registerTableListener(): void {
        this.tableSubscriber = {
            eventSubscriberId: 'import-table-listener',
            eventPublished: async (data: TableEventData, eventId: string): Promise<void> => {
                const isTable = data?.tableId === this.state.table?.getTableId();
                if (isTable && eventId === TableEvent.ROW_SELECTION_CHANGED) {
                    const rows = this.state.table.getSelectedRows();
                    const objects = rows.map((r) => r.getRowObject().getObject());
                    this.state.importManager.objects = objects;
                    this.state.canRun = !!objects.length;
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
    }

    private async createTable(): Promise<void> {
        this.state.table = null;

        if (this.state.importManager && this.context) {
            const tableConfiguration = await this.importRunner.getTableConfiguration();

            if (Array.isArray(tableConfiguration?.tableColumns)) {
                tableConfiguration.tableColumns = tableConfiguration?.tableColumns.filter(
                    (c) => !this.importRunner?.getIgnoreProperties().some((ip) => ip === c.property)
                );
            }

            const table = await TableFactoryService.getInstance().createTable(
                `import-dialog-list-${this.objectType}`, this.objectType, tableConfiguration, null,
                this.context?.contextId, false
            );

            this.prepareTableTitle();

            setTimeout(async () => {
                this.state.table = table;
            }, 100);
        }
    }

    private async prepareTableTitle(): Promise<void> {
        const objectName = await LabelService.getInstance().getObjectName(this.objectType, true);
        const objectCount = this.state.importManager.objects.length;
        const tableTitle = await TranslationService.translate(
            'Translatable#Overview of {0} to import ({1})', [objectName, objectCount]
        );
        this.state.tableTitle = tableTitle;
    }

    public cancel(): void {
        ContextService.getInstance().toggleActiveContext();
    }

    private loadCSV(): void {
        this.importFormTimeout = setTimeout(async () => {
            this.importFormTimeout = null;

            await this.loadObjectsFromCSV();

            const errors = this.importRunner?.getErrors();
            if (errors?.length) {
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, new ComponentContent('list-with-title',
                        {
                            title: 'Translatable#Error',
                            list: errors
                        }
                    ), 'Translatable#Error!', null, true
                );

            } else {
                this.context?.setObjectList(this.objectType, this.importRunner?.getCSVObjects());
            }

            await this.createTable();
            this.prepareTableTitle();
        }, 100);
    }

    private async loadObjectsFromCSV(): Promise<void> {
        const formInstance = await this.context?.getFormManager().getFormInstance();
        const source = await formInstance.getFormFieldValueByProperty(ImportProperty.SOURCE);

        const characterSetValue = await formInstance.getFormFieldValueByProperty<string[]>(
            ImportProperty.CHARACTER_SET
        );
        const characterSet = Array.isArray(characterSetValue.value) && characterSetValue.value.length
            ? characterSetValue.value[0]
            : null;

        const valueSeparatorValue = await formInstance.getFormFieldValueByProperty<string[]>(
            ImportProperty.VALUE_SEPARATOR
        );
        const valueSeparator = Array.isArray(valueSeparatorValue.value)
            ? valueSeparatorValue.value
            : [];

        const textSeparatorValue = await formInstance.getFormFieldValueByProperty<string[]>(
            ImportProperty.TEXT_SEPARATOR
        );
        const textSeparator = Array.isArray(textSeparatorValue.value) && textSeparatorValue.value.length
            ? textSeparatorValue.value[0]
            : null;

        if (source.value[0]) {
            await this.importRunner?.loadObjectsFromCSV(
                source.value[0], characterSet, valueSeparator, textSeparator
            );
        }
    }

    public async run(): Promise<void> {
        if (this.state.canRun) {
            this.cancelImportProcess = false;
            const objectName = await LabelService.getInstance().getObjectName(
                this.state.importManager.objectType, true
            );

            const objects = this.state.importManager.objects;

            const question = await TranslationService.translate(
                'Translatable#Import {0} {1}. Execute?', [objects.length, objectName]
            );
            BrowserUtil.openConfirmOverlay(
                'Translatable#Execute now?',
                question,
                this.runImportManager.bind(this)
            );
        }
    }

    private async runImportManager(): Promise<void> {
        this.state.run = true;

        const objectName = await LabelService.getInstance().getObjectName(
            this.state.importManager.objectType, true
        );
        this.state.table.getRows().forEach((r) => r.setValueState(ValueState.NONE));
        const selectedRows = this.state.table.getSelectedRows();
        this.finishedObjects = [];
        this.errorObjects = [];

        await this.setDialogLoadingInfo();

        const objectTimes: number[] = [];

        for (const row of selectedRows) {
            const start = Date.now();
            let end: number;

            const object = row.getRowObject().getObject();

            const values = await this.state.importManager.getEditableValues();
            await this.importRunner?.execute(object, values)
                .then(() => {
                    this.finishedObjects.push(object);
                    row.select(false);
                    row.setValueState(ValueState.HIGHLIGHT_SUCCESS);
                    end = Date.now();
                }).catch(async (error) => {
                    this.errorObjects.push(object);
                    row.setValueState(ValueState.HIGHLIGHT_ERROR);
                    BrowserUtil.toggleLoadingShield('APP_SHIELD', false, 'Translatable#An error occurred.');
                    end = Date.now();
                    await this.handleObjectEditError(object, error);
                });

            if (this.cancelImportProcess) {
                break;
            }

            objectTimes.push(end - start);
            await this.setDialogLoadingInfo(objectTimes, selectedRows.length);
        }

        if (!this.errorObjects.length) {
            const succesText = await TranslationService.translate('Translatable#{0} imported', [objectName]);
            BrowserUtil.openSuccessOverlay(succesText);
        }

        BrowserUtil.toggleLoadingShield('APP_SHIELD', false);
    }

    private async setDialogLoadingInfo(times: number[] = [], objectsCount: number = 0): Promise<void> {
        const objectName = await LabelService.getInstance().getObjectName(
            this.state.importManager.objectType, true
        );
        const average = BrowserUtil.calculateAverage(times);
        const time = average * (objectsCount - this.finishedObjects.length - this.errorObjects.length);
        const finishCount = this.finishedObjects.length + this.errorObjects.length;
        const totalCount = objectsCount;
        const loadingHint = await TranslationService.translate(
            'Translatable#{0}/{1} {2} imported', [finishCount, totalCount, objectName]
        );
        BrowserUtil.toggleLoadingShield(
            'APP_SHIELD', true, loadingHint, time, this.cancelImport.bind(this)
        );
    }

    private cancelImport(): void {
        this.cancelImportProcess = true;
    }

    private handleObjectEditError(object: KIXObject, error: Error): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const objectName = await LabelService.getInstance().getObjectName(
                this.state.importManager.objectType, false, false
            );
            const identifier = await this.state.importManager.getIdentifierText(object);
            const confirmText = await TranslationService.translate(
                // tslint:disable-next-line:max-line-length
                'Translatable#Row {0} of the file with {1} {2}: could not import{3}. How to continue?',
                [
                    object['CSV_LINE'],
                    objectName,
                    identifier,
                    error ? ' (' + error.Message + ')' : ''
                ]
            );

            const finishCount = this.finishedObjects.length + this.errorObjects.length;
            const totalCount = this.state.importManager.objects.length + this.finishedObjects.length;

            const title = `${objectName}: ${finishCount}/${totalCount}`;
            const ignoreText = await TranslationService.translate('Translatable#Ignore');
            const cancelText = await TranslationService.translate('Translatable#Cancel');

            BrowserUtil.openConfirmOverlay(
                title,
                confirmText,
                () => { resolve(); },
                () => {
                    this.cancelImportProcess = true;
                    resolve();
                },
                [ignoreText, cancelText],
                undefined, undefined, true
            );
        });
    }
}

module.exports = Component;
