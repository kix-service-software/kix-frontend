/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
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
import { LinkManager } from '../../../../links/webapp/core/LinkManager';
import { BulkRunner } from '../../core/BulkRunner';
import { TableEvent } from '../../../../table/model/TableEvent';
import { TableEventData } from '../../../../table/model/TableEventData';
import { ValueState } from '../../../../table/model/ValueState';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { Table } from '../../../../table/model/Table';

class Component {

    private state: ComponentState;

    private tableSubscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState();
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
            this.setCanRun();
        });

        this.state.linkManager = new LinkManager(this.state.bulkManager?.objectType);

        this.state.linkManager?.registerListener('bulk-dialog--link-listener', async () => {
            this.setCanRun();
        });
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
    }

    private async setCanRun(): Promise<void> {
        const hasDefinedValues = await this.state.bulkManager?.hasDefinedValues();
        const hasDefinedLinks = await this.state.linkManager?.hasDefinedValues();
        this.state.canRun = (hasDefinedValues || hasDefinedLinks) && !!this.state.bulkManager?.objects?.length;
    }

    public async reset(): Promise<void> {
        this.state.bulkManager?.reset();
        const dynamicFormComponent = (this as any).getComponent(this.state.componentId);
        if (dynamicFormComponent) {
            dynamicFormComponent.updateValues();
        }

        this.state.linkManager?.reset();
        const linkFormComponent = (this as any).getComponent(this.state.componentId + 'LinkManager');
        if (linkFormComponent) {
            linkFormComponent.updateValues();
        }
    }

    public cancel(): void {
        ContextService.getInstance().toggleActiveContext();
    }

    private async createTable(): Promise<void> {
        if (this.state.bulkManager && !this.state.table) {

            if (this.state.bulkManager?.objects) {

                const configuration = new TableConfiguration(null, null);

                configuration.displayLimit = 5;
                configuration.headerHeight = TableHeaderHeight.SMALL;
                configuration.rowHeight = TableRowHeight.SMALL;
                configuration.enableSelection = true;

                const table = await TableFactoryService.getInstance().createTable(
                    `bulk-form-list-${this.state.bulkManager?.objectType}`, this.state.bulkManager?.objectType,
                    configuration, null, BulkDialogContext.CONTEXT_ID, true, null, true
                );

                await this.prepareTitle();

                this.tableSubscriber = {
                    eventSubscriberId: 'bulk-table-listener',
                    eventPublished: async (data: TableEventData, eventId: string): Promise<void> => {
                        if (data && data.tableId === table.getTableId()) {
                            if (eventId === TableEvent.TABLE_INITIALIZED) {
                                table?.selectAll();
                            }

                            const rows = this.state.table?.getSelectedRows();
                            const objects = rows?.map((r) => r.getRowObject().getObject());
                            if (this.state.bulkManager) {
                                this.state.bulkManager.objects = objects;
                                this.setCanRun();
                            }
                            await this.prepareTitle();
                        }
                    }
                };

                EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
                EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
                EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);

                await table.initialize();

                this.state.table = table;
            }
        }
    }

    private async prepareTitle(): Promise<void> {
        if (this.state.table) {
            const objectName = await LabelService.getInstance().getObjectName(this.state.bulkManager?.objectType, true);
            const objectCount = this.state.table?.getRows().length;
            this.state.tableTitle = await TranslationService.translate(
                'Translatable#Selected {0} ({1})', [objectName, objectCount]
            );
        }
    }

    public async run(): Promise<void> {
        const objectName = await LabelService.getInstance().getObjectName(this.state.bulkManager?.objectType, true);

        let validationResult = await this.state.bulkManager?.validate();
        const linkValidationResult = await this.state.linkManager?.validate();
        validationResult = [...validationResult, ...linkValidationResult];

        if (validationResult.some((r) => r.severity === ValidationSeverity.ERROR)) {
            this.showValidationError(validationResult.filter((r) => r.severity === ValidationSeverity.ERROR));
        } else {
            const objects = this.state.bulkManager?.objects;
            const editableValues = await this.state.bulkManager?.getEditableValues();

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

        this.state.table?.getRows().forEach((r) => r.setValueState(ValueState.NONE));

        const parameter = await this.state.bulkManager?.prepareParameter();
        const linkDescriptions = await this.state.linkManager?.prepareLinkDesriptions();

        const result = await BulkRunner.run(
            this.state.bulkManager.objects, this.state.bulkManager.objectType, parameter, linkDescriptions
        );

        let successObjects = [];
        let errorObjects = [];
        if (result?.length === 2) {
            successObjects = result[0];
            errorObjects = result[1];
        }

        await this.updateTable(this.state.table, successObjects, errorObjects);

        if (!result[1].length) {
            const toast = await TranslationService.translate('Translatable#Changes saved.');
            BrowserUtil.openSuccessOverlay(toast);
        }

        BrowserUtil.toggleLoadingShield('BULK_SHIELD', false);
    }

    private async updateTable(table: Table, successObjects: KIXObject[], errorObjects: KIXObject[]): Promise<void> {
        this.state.table = null;

        const context = ContextService.getInstance().getActiveContext();
        const oldObjects = await context.getObjectList(this.state.bulkManager?.objectType);
        const idsToLoad = oldObjects ? oldObjects.map((o) => o.ObjectId) : null;

        const newObjects = await KIXObjectService.loadObjects(
            this.state.bulkManager?.objectType, idsToLoad, null, null, false
        ).catch(() => []);
        context.setObjectList(this.state.bulkManager?.objectType, newObjects);
        this.prepareTitle();

        this.state.table = table;

        setTimeout(() => {
            successObjects?.forEach((o) => {
                table?.selectRowByObject(o, false);
                table?.setRowObjectValueState([o], ValueState.HIGHLIGHT_SUCCESS);
            });

            errorObjects?.forEach((o) => table?.setRowObjectValueState([o], ValueState.HIGHLIGHT_ERROR));
        }, 400);
    }
}

module.exports = Component;
