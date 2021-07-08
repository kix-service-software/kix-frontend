/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ImportConfigValue } from './ImportConfigValue';
import { Context } from 'vm';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ImportService, ImportPropertyOperator } from '../../core';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { TableEvent, TableFactoryService, TableEventData, ValueState } from '../../../../base-components/webapp/core/table';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';
import { DefaultSelectInputFormOption } from '../../../../../model/configuration/DefaultSelectInputFormOption';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { SortOrder } from '../../../../../model/SortOrder';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { Error } from '../../../../../../../server/model/Error';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';

class Component {

    private state: ComponentState;
    private importConfigs: Map<string, ImportConfigValue[]> = new Map();
    private context: Context;
    private objectType: KIXObjectType | string;
    private tableSubscriber: IEventSubscriber;
    private formListenerId: string;
    private csvObjects: any[];
    private csvProperties: string[];
    private fileLoaded: boolean = false;

    private cancelImportProcess: boolean;
    private errorObjects: KIXObject[];
    private finishedObjects: KIXObject[];
    private selectedObjects: KIXObject[];

    private propertiesFormTimeout;
    private importFormTimeout;
    private formSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
        WidgetService.getInstance().setWidgetType('dynamic-form-field-group', WidgetType.GROUP);
        this.importConfigs = new Map(
            [
                [
                    'character_set', [
                        new ImportConfigValue('UTF-8', 'UTF 8'),
                        new ImportConfigValue('ISO-8859-1', 'ISO 8859-1'),
                        new ImportConfigValue('ISO-8859-14', 'ISO 8859-14'),
                        new ImportConfigValue('ISO-8859-15', 'ISO 8859-15')
                    ]
                ],
                [
                    'value_separator', [
                        new ImportConfigValue('COMMA', 'Translatable#, (comma)', ','),
                        new ImportConfigValue('SEMICOLON', 'Translatable#; (semicolon)', ';'),
                        new ImportConfigValue('COLON', 'Translatable#: (colon)', ':'),
                        new ImportConfigValue('DOT', 'Translatable#. (dot)', '.'),
                        new ImportConfigValue('TAB', 'Translatable#-> (tab)', '\\t')
                    ]
                ],
                [
                    'text_separator', [
                        new ImportConfigValue('DOUBLE', 'Translatable#DOUBLE_QUOTES', '"'),
                        new ImportConfigValue('SINGLE', 'Translatable#SINGLE_QUOTES', '\'')
                    ]
                ]
            ]
        );
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        if (this.context) {
            const types = this.context.descriptor.kixObjectTypes;
            if (types && !!types.length && typeof types[0] === 'string' && types[0].length) {
                this.objectType = types[0];

                const importManager = ImportService.getInstance().getImportManager(this.objectType);
                importManager.reset(false);
                this.state.importManager = importManager;

                this.formListenerId = `import-form-listener-${this.objectType}`;
                this.state.importManager.registerListener(this.formListenerId, () => {
                    if (this.propertiesFormTimeout) {
                        clearTimeout(this.propertiesFormTimeout);
                    }
                    this.propertiesFormTimeout = setTimeout(async () => {
                        this.propertiesFormTimeout = null;
                        await this.setTableColumns();
                        await this.setContextObjects();
                    }, 200);
                });
            }
        }

        this.formSubscriber = {
            eventSubscriberId: 'ImportDialog',
            eventPublished: (data: FormValuesChangedEventData, eventId: string) => {
                if (this.importFormTimeout) {
                    clearTimeout(this.importFormTimeout);
                } else {
                    this.fileLoaded = false;
                }
                this.importFormTimeout = setTimeout(async () => {
                    this.importFormTimeout = null;
                    await this.prepareTableDataByCSV();
                }, 100);
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);

        this.prepareImportConfigForm();
        this.createTable();
    }

    public async onInput(input: any): Promise<any> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Replace Values', 'Translatable#Start Import'
        ]);

        return input;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        if (this.state.importManager) {
            this.state.importManager.unregisterListener(this.formListenerId);
            this.state.importManager.reset();
        }
        TableFactoryService.getInstance().destroyTable(`import-dialog-list-${this.objectType}`);
    }

    private async prepareImportConfigForm(): Promise<void> {
        const formGroup = new FormGroupConfiguration(
            'import-form-group-configuration', 'Translatable#Import configurations', [], null, [
            new FormFieldConfiguration(
                'import-form-field-source',
                'Translatable#Source', 'source', 'attachment-input', true,
                // tslint:disable-next-line:max-line-length
                'Translatable#Helptext_Import_File',
                [
                    new FormFieldOption('MimeTypes', ['text/', '', 'application/vnd.ms-excel']),
                    new FormFieldOption('MULTI_FILES', false)
                ]
            ),
            new FormFieldConfiguration(
                'import-form-field-charset',
                'Translatable#Charset', 'character_set', 'default-select-input', true,
                'Translatable#Helptext_Import_CharacterSet.',
                [
                    new FormFieldOption(
                        DefaultSelectInputFormOption.NODES,
                        this.importConfigs.get('character_set').map((v) => new TreeNode(v.key, v.label))
                    )
                ],
                new FormFieldValue('UTF-8')
            ),
            new FormFieldConfiguration(
                'import-form-field-option',
                'Translatable#Split Option', 'value_separator', 'default-select-input', true,
                'Translatable#Helptext_Import_ValueSeparator.',
                [
                    new FormFieldOption(
                        DefaultSelectInputFormOption.NODES,
                        this.importConfigs.get('value_separator').map((v) => new TreeNode(v.key, v.label))
                    ),
                    new FormFieldOption(DefaultSelectInputFormOption.MULTI, true)
                ],
                new FormFieldValue(['COMMA', 'SEMICOLON', 'TAB'])
            ),
            new FormFieldConfiguration(
                'import-form-field-separator',
                'Translatable#Text separator', 'text_separator', 'default-select-input', true,
                'Translatable#Helptext_Import_TextSeparator.',
                [
                    new FormFieldOption(
                        DefaultSelectInputFormOption.NODES,
                        this.importConfigs.get('text_separator').map((v) => new TreeNode(v.key, v.label))
                    )
                ],
                new FormFieldValue(['DOUBLE'])
            )
        ]);

        const form = new FormConfiguration(
            'import-file-config', 'Import configuration',
            [], KIXObjectType.ANY, true, FormContext.NEW, null,
            [
                new FormPageConfiguration(
                    'import-form-page-configuration', 'Import configurations', [], null, null, [formGroup]
                )
            ]
        );

        await FormService.getInstance().addForm(form);
        const context = ContextService.getInstance().getActiveContext();
        await context?.getFormManager().setFormId(form.id);
        this.state.prepared = true;
    }

    private async createTable(): Promise<void> {
        if (this.state.importManager && this.context) {

            const configuration = new TableConfiguration(null, null, null,
                this.objectType, null, null, await this.getColumnConfig(), [],
                true, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
            const table = await TableFactoryService.getInstance().createTable(
                `import-dialog-list-${this.objectType}`, this.objectType,
                configuration, null, this.context.contextId,
                false, null, true, false, true
            );
            table.sort('CSV_LINE', SortOrder.UP);

            this.prepareTitle();

            this.tableSubscriber = {
                eventSubscriberId: 'import-table-listener',
                eventPublished: async (data: TableEventData, eventId: string) => {
                    if (data && this.state.table && data.tableId === this.state.table.getTableId()) {
                        if (eventId === TableEvent.TABLE_INITIALIZED || eventId === TableEvent.TABLE_READY) {
                            if (!this.selectedObjects || !!!this.selectedObjects.length) {
                                this.state.table.selectAll();
                            } else {
                                const selectedObjects = [...this.selectedObjects];
                                this.state.table.setRowSelectionByObject(selectedObjects);
                            }
                        }
                        if (eventId === TableEvent.TABLE_READY) {
                            this.state.table.setRowObjectValueState(this.errorObjects, ValueState.HIGHLIGHT_ERROR);
                            this.state.table.setRowObjectValueState(
                                this.finishedObjects, ValueState.HIGHLIGHT_SUCCESS
                            );
                        }

                        const rows = this.state.table.getSelectedRows();
                        const objects = rows.map((r) => r.getRowObject().getObject());

                        if (eventId === TableEvent.ROW_SELECTION_CHANGED) {
                            this.selectedObjects = objects;
                        }

                        this.state.importManager.objects = objects;
                        this.state.canRun = !!objects.length;
                        this.prepareTitle();
                    }
                }
            };

            EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
            EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
            EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);

            this.state.table = table;
        }
    }

    private async getColumnConfig(): Promise<IColumnConfiguration[]> {
        const requiredProperties = await this.state.importManager.getRequiredProperties();
        let columns: IColumnConfiguration[] = [
            new DefaultColumnConfiguration(null, null, null,
                'CSV_LINE', true, false, true, false, 150, true, true, false, DataType.NUMBER, false,
                null, 'Translatable#Row Number'
            )
        ];

        requiredProperties.forEach((rp) => {
            const config = TableFactoryService.getInstance().getDefaultColumnConfiguration(
                this.objectType, rp
            );
            if (config) {
                columns.push(config);
            }
        });

        if (this.csvProperties && !!this.csvProperties.length) {
            const columnProperties = await this.state.importManager.getColumnProperties();
            this.csvProperties.filter(
                (p) => !columns.some((c) => c.property === p) && columnProperties.some((kp) => kp === p)
            ).forEach((ip) => {
                const config = TableFactoryService.getInstance().getDefaultColumnConfiguration(
                    this.objectType, ip
                );
                if (config) {
                    columns.push(config);
                }
            });
        }

        if (this.state.importManager && await this.state.importManager.hasDefinedValues()) {
            const values = await this.state.importManager.getEditableValues();
            values.filter((v) => v.operator !== ImportPropertyOperator.IGNORE)
                .map((v) => v.property)
                .filter((p) =>
                    !columns.some((c) => c.property === p)
                ).forEach((ip) => {
                    const config = TableFactoryService.getInstance().getDefaultColumnConfiguration(
                        this.objectType, ip
                    );
                    if (config) {
                        columns.push(config);
                    }
                });
            columns = columns.filter(
                (c) => !values.filter((v) => v.operator === ImportPropertyOperator.IGNORE).some(
                    (v) => c.property === v.property)
            );
        }
        return columns;
    }

    private async prepareTitle(): Promise<void> {
        const objectName = await LabelService.getInstance().getObjectName(this.objectType, true);
        const objectCount = this.state.importManager.objects.length;
        const tableTitle = await TranslationService.translate(
            'Translatable#Overview of {0} to import ({1})', [objectName, objectCount]
        );
        this.state.tableTitle = tableTitle;
    }

    private async prepareTableDataByCSV(): Promise<void> {
        this.errorObjects = [];
        this.finishedObjects = [];
        this.selectedObjects = [];
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        if (formInstance) {
            const source = await formInstance.getFormFieldValueByProperty('source');
            let ok = false;
            if (source && source.valid && source.value && Array.isArray(source.value) && !!source.value) {
                this.fileLoaded = true;
                const characterSet = await formInstance.getFormFieldValueByProperty('character_set');
                const valueSeparator = await formInstance.getFormFieldValueByProperty<string[]>('value_separator');
                const textSeparator = await formInstance.getFormFieldValueByProperty('text_separator');

                const importString = await BrowserUtil.readFileAsText(
                    source.value[0],
                    characterSet && characterSet.valid && this.importConfigs.get('character_set').some(
                        (v) => v.key === characterSet.value[0]
                    ) ? this.importConfigs.get('character_set').find(
                        (v) => v.key === characterSet.value[0]
                    ).value : null
                );

                ok = importString && !!importString.length
                    && valueSeparator && valueSeparator.valid
                    && textSeparator && textSeparator.valid;

                if (!ok && !!!importString.length) {
                    BrowserUtil.openErrorOverlay('Translatable#Can not use file (file is empty).');
                }

                if (ok) {
                    ok = await this.prepareImportData(
                        this.getCSVData(importString,
                            Array.isArray(valueSeparator.value) ? valueSeparator.value : [valueSeparator.value],
                            Array.isArray(textSeparator.value) ? textSeparator.value[0] : textSeparator.value
                        )
                    );
                    if (ok) {
                        ok = await this.setTableColumns();
                    }
                }
            }

            if (!ok) {
                const newColumnConfigs = await this.getColumnConfig();
                this.state.table.removeColumns(
                    this.state.table.getColumns().filter(
                        (c) => !newColumnConfigs.some((cc) => cc.property === c.getColumnId())
                    ).map((c) => c.getColumnId())
                );
                this.csvObjects = [];
            }
            await this.setContextObjects();
        }
    }

    private async prepareImportData(list: string[][]): Promise<boolean> {
        this.csvObjects = [];
        this.csvProperties = [];

        const csvProperties = list && !!list.length ? list.shift() : [];

        let ok: boolean = true;
        if (await this.checkForKnownProperties(csvProperties)) {
            this.csvProperties = csvProperties;

            const lineErrors: number[] = [];
            list.forEach((r, rowIndex) => {
                if (!!r.length && (r.length > 1 || r[0] !== '')) {
                    const object = {};
                    if (r.length < this.csvProperties.length) {
                        lineErrors.push(rowIndex + 2);
                    }
                    this.csvProperties.forEach((p, index) => {
                        object[p] = typeof r[index] !== 'undefined' ? r[index] : '';
                    });
                    object['CSV_LINE'] = rowIndex + 2;
                    this.csvObjects.push(object);
                }
            });

            if (!!lineErrors.length) {
                const title = await TranslationService.translate('Translatable#Rows with too less values');
                const rowLabel = await TranslationService.translate('Translatable#Row');
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, new ComponentContent('list-with-title',
                        {
                            title: title + ':',
                            list: lineErrors.map((i) => `${rowLabel} ${i}.`)
                        }
                    ), 'Translatable#Error!', null, true
                );
            }
        } else {
            ok = false;
        }
        return ok;
    }

    private getCSVData(importString: string, valueseparatorKey: string[], textSeparatorKey: string): string[][] {
        const textSeparator = this.importConfigs.get('text_separator').find((v) => v.key === textSeparatorKey);
        const textSeparatorString = textSeparator && textSeparator.value ? textSeparator.value : '\'';
        const valueseparators = this.importConfigs.get('value_separator').filter(
            (v) => valueseparatorKey.some((vsk) => vsk === v.key)
        );
        const valueseparatorString = valueseparators && !!valueseparators.length
            ? `[${valueseparators.map((vs) => vs.value).join('')}]` : ';';

        return BrowserUtil.parseCSV(importString, textSeparatorString, valueseparatorString);
    }

    private async checkForKnownProperties(properties: string[]): Promise<boolean> {
        const knownProperties = await this.state.importManager.getKnownProperties();
        const unknownProperties = [];
        const confirmedProperties = [];
        properties.forEach((p) => {
            if (knownProperties.some((kn) => kn === p)) {
                confirmedProperties.push(p);
            } else {
                unknownProperties.push(p);
            }
        });
        let ok: boolean = true;
        if (!properties || !!!properties.length || !!!confirmedProperties.length) {
            BrowserUtil.openErrorOverlay(
                'Translatable#Can not use file (no known properties found).'
            );
            ok = false;
        } else if (!!unknownProperties.length) {
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, new ComponentContent('list-with-title',
                    {
                        title: 'Translatable#Unknown properties (will be ignored):',
                        list: unknownProperties,
                        doNotTranslateList: true
                    }
                ), 'Translatable#Error!', null, true
            );
        }
        return ok;
    }

    private async setTableColumns(): Promise<boolean> {
        let ok: boolean = true;
        if (!this.fileLoaded || await this.checkRequiredProperties()) {
            const knownProperties = await this.state.importManager.getKnownProperties();
            this.csvProperties = this.csvProperties && this.csvProperties.length
                ? this.csvProperties.filter((ip) => knownProperties.some((kn) => kn === ip)) : [];
            if (this.state.table) {
                const newColumnConfigs = await this.getColumnConfig();
                this.state.table.removeColumns(this.state.table.getColumns().map((c) => c.getColumnId()));
                if (!!newColumnConfigs.length) {
                    await this.state.table.addAdditionalColumns(newColumnConfigs);
                }
            }
        } else {
            ok = false;
        }
        return ok;
    }

    private async checkRequiredProperties(): Promise<boolean> {
        const requiredProperties = await this.state.importManager.getRequiredProperties();
        const adjustableProperties = await this.state.importManager.getProperties();
        const missingProperties: string[] = [];
        requiredProperties.filter((rp) => !adjustableProperties.some((ap) => ap[0] === rp)).forEach((rP) => {
            const alternative = this.state.importManager.getAlternativeProperty(rP);
            let missing = false;
            if (!this.csvProperties || !!!this.csvProperties.length) {
                missing = true;
            } else if (!this.csvProperties.some((a) => rP === a)) {
                missing = true;
                if (alternative && this.csvProperties.some((a) => alternative === a)) {
                    missing = false;
                }
            }
            if (missing) {
                missingProperties.push(`${rP}${alternative && alternative !== rP ? ' / ' + alternative : ''}`);
            }
        });
        if (!!missingProperties.length) {
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, new ComponentContent('list-with-title',
                    {
                        title: 'Translatable#Can not use file (missing required properties):',
                        list: missingProperties,
                        doNotTranslateList: true
                    }
                ), 'Translatable#Error!', null, true
            );
        }
        return !!!missingProperties.length;
    }

    private async setContextObjects() {
        if (this.context) {
            const objects = [];
            if (this.csvObjects && !!this.csvObjects) {
                for (const o of this.csvObjects) {
                    const object = await this.state.importManager.getObject(o);
                    objects.push(object);
                }
            }
            if (!!objects.length) {
                if (await this.state.importManager.hasDefinedValues()) {
                    const values = await this.state.importManager.getEditableValues();
                    values.forEach((v) => {
                        objects.forEach((o) => {
                            const value = Array.isArray(v.value) ? v.value[0] : v.value;
                            switch (v.operator) {
                                case ImportPropertyOperator.REPLACE_EMPTY:
                                    if (
                                        typeof o[v.property] === 'undefined'
                                        || o[v.property] === null
                                        || o[v.property] === ''
                                    ) {
                                        o[v.property] = value;
                                    }
                                    break;
                                case ImportPropertyOperator.FORCE:
                                    o[v.property] = value;
                                    break;
                                case ImportPropertyOperator.IGNORE:
                                    delete o[v.property];
                                    break;
                                default:
                            }
                        });
                    });
                }
            }
            this.context.setObjectList(this.state.importManager.objectType, objects);
        }
    }

    public cancel(): void {
        ContextService.getInstance().toggleActiveContext();
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
        const objects = [...this.state.importManager.objects];
        this.state.table.getRows().forEach((r) => r.setValueState(ValueState.NONE));
        this.finishedObjects = [];
        this.errorObjects = [];

        await this.setDialogLoadingInfo();

        const objectTimes: number[] = [];
        const columns = this.state.table.getColumns();

        for (const object of objects) {
            const start = Date.now();
            let end: number;

            await this.state.importManager.execute(object, columns)
                .then(() => {
                    this.finishedObjects.push(object);
                    this.state.table.selectRowByObject(object, false);
                    this.state.table.setRowObjectValueState([object], ValueState.HIGHLIGHT_SUCCESS);
                    end = Date.now();
                }).catch(async (error) => {
                    this.errorObjects.push(object);
                    this.state.table.setRowObjectValueState([object], ValueState.HIGHLIGHT_ERROR);
                    BrowserUtil.toggleLoadingShield('APP_SHIELD', false, 'Translatable#An error occurred.');
                    end = Date.now();
                    await this.handleObjectEditError(object, error);
                });

            if (this.cancelImportProcess) {
                break;
            }

            objectTimes.push(end - start);
            await this.setDialogLoadingInfo(objectTimes, objects.length);
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
        const totalCount = this.state.importManager.objects.length + this.finishedObjects.length;
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
