import { ComponentState } from './ComponentState';
import {
    ContextService, LabelService, FormService, WidgetService, TableFactoryService,
    TableConfiguration, IColumnConfiguration, TableHeaderHeight, TableRowHeight,
    TableEvent, TableEventData, BrowserUtil, OverlayService, DefaultColumnConfiguration, ValueState
} from '../../../../core/browser';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';
import { TabContainerEvent, TabContainerEventData } from '../../../../core/browser/components';
import { ImportService, ImportPropertyOperator } from '../../../../core/browser/import';
import {
    KIXObjectType, ContextMode, Form, FormContext, FormField, FormFieldOption,
    FormFieldOptionsForDefaultSelectInput, TreeNode, FormFieldValue, WidgetType,
    KIXObject, OverlayType, ComponentContent, DataType, Error, SortOrder, ContextType, Context
} from '../../../../core/model';
import { FormGroup } from '../../../../core/model/components/form/FormGroup';
import { ImportConfigValue } from './ImportConfigValue';
import { DialogService } from '../../../../core/browser/components/dialog';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component {

    private state: ComponentState;
    private importConfigs: Map<string, ImportConfigValue[]> = new Map();
    private context: Context;
    private objectType: KIXObjectType;
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

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
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
                        new ImportConfigValue('COMMA', 'Translatable#, (Komma)', ','),
                        new ImportConfigValue('SEMICOLON', 'Translatable#; (Semikolon)', ';'),
                        new ImportConfigValue('COLON', 'Translatable#: (Doppelpunkt)', ':'),
                        new ImportConfigValue('DOT', 'Translatable#. (Punkt)', '.'),
                        new ImportConfigValue('TAB', 'Translatable#-> (Tabulator)', '\\t')
                    ]
                ],
                [
                    'text_separator', [
                        new ImportConfigValue('DOUBLE', 'Translatable#" (Doppeltes Hochkomma)', '"'),
                        new ImportConfigValue('SINGLE', "Translatable#' (Einfaches Hochkomma)", "'")
                    ]
                ]
            ]
        );
    }

    public async onInput(input: any): Promise<void> {
        this.reset(input ? input.instanceId : '');

        this.context = await ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        if (this.context) {
            const types = await this.context.getDescriptor().kixObjectTypes;
            if (types && !!types.length && typeof types[0] === 'string' && types[0].length) {
                this.objectType = types[0];

                const importManager = ImportService.getInstance().getImportManager(this.objectType);
                importManager.init();
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
        this.prepareImportConfigForm();

        if (this.objectType) {
            FormService.getInstance().registerFormInstanceListener(this.state.importConfigFormId, {
                formListenerId: this.formListenerId,
                formValueChanged: async (formField: FormField, value: FormFieldValue<any>) => {
                    if (this.importFormTimeout) {
                        clearTimeout(this.importFormTimeout);
                    } else {
                        const loadingHint = await TranslationService.translate('Translatable#Read file.');
                        this.fileLoaded = false;
                        DialogService.getInstance().setMainDialogLoading(true, loadingHint);
                    }
                    this.importFormTimeout = setTimeout(async () => {
                        this.importFormTimeout = null;
                        await this.prepareTableDataByCSV();
                        DialogService.getInstance().setMainDialogLoading(false);
                    }, 100);

                },
                updateForm: () => { return; }
            });
        }

        this.createTable();
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        FormService.getInstance().removeFormInstanceListener(this.state.importConfigFormId, this.formListenerId);
        FormService.getInstance().deleteFormInstance(this.state.importConfigFormId);
        if (this.state.importManager) {
            this.state.importManager.unregisterListener(this.formListenerId);
        }
    }

    private reset(instanceId: string): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        FormService.getInstance().deleteFormInstance(this.state.importConfigFormId);
        FormService.getInstance().removeFormInstanceListener(this.state.importConfigFormId, this.formListenerId);
        if (this.state.importManager) {
            this.state.importManager.unregisterListener(this.formListenerId);
        }
        this.state = new ComponentState(instanceId);
        this.csvObjects = [];
        this.csvProperties = [];
        this.cancelImportProcess = false;
        this.errorObjects = [];
        this.finishedObjects = [];
        this.selectedObjects = [];
        this.propertiesFormTimeout = null;
        this.importFormTimeout = null;
        this.fileLoaded = false;
    }

    private async prepareImportConfigForm(): Promise<void> {
        const formGroup = new FormGroup('Import configurations', [
            new FormField(
                'Translatable#Source', 'source', 'attachment-input', true,
                // tslint:disable-next-line:max-line-length
                'Translatable#CSV-Datei mit den zu importierenen Datensätzen. Ein Einfügen per Drag & Drop ist möglich. Bitte beachten Sie die maximale Dateigröße von 25 MB pro Datei.',
                [
                    new FormFieldOption('MimeTypes', ['text/csv']),
                    new FormFieldOption('MULTI_FILES', false)
                ]
            ),
            new FormField(
                'Translatable#Charset', 'character_set', 'default-select-input', true,
                'Translatable#Wählen Sie den Zeichensatz der Quelle aus.',
                [
                    new FormFieldOption(
                        FormFieldOptionsForDefaultSelectInput.NODES,
                        this.importConfigs.get('character_set').map((v) => new TreeNode(v.key, v.label))
                    )
                ],
                new FormFieldValue('UTF-8')
            ),
            new FormField(
                'Translatable#Split Option', 'value_separator', 'default-select-input', true,
                'Translatable#Wählen Sie die in der Quelle verwendeten Trennzeichen aus.',
                [
                    new FormFieldOption(
                        FormFieldOptionsForDefaultSelectInput.NODES,
                        this.importConfigs.get('value_separator').map((v) => new TreeNode(v.key, v.label))
                    ),
                    new FormFieldOption(FormFieldOptionsForDefaultSelectInput.MULTI, true)
                ],
                new FormFieldValue('SEMICOLON')
            ),
            new FormField(
                'Translatable#Text separator', 'text_separator', 'default-select-input', true,
                'Translatable#Wählen Sie das in der Quelle verwendete Textbegrenzungszeichen aus.',
                [
                    new FormFieldOption(
                        FormFieldOptionsForDefaultSelectInput.NODES,
                        this.importConfigs.get('text_separator').map((v) => new TreeNode(v.key, v.label))
                    )
                ],
                new FormFieldValue('DOUBLE')
            )
        ]);

        const form = new Form(
            'import-file-config', 'Import configuration',
            [formGroup], KIXObjectType.ANY, true, FormContext.NEW
        );
        this.state.importConfigFormId = form.id;

        FormService.getInstance().addform(form);
    }

    private async createTable(): Promise<void> {
        if (this.state.importManager && this.context) {

            const configuration = new TableConfiguration(
                this.objectType, null, null, await this.getColumnConfig(),
                null, true, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
            const table = TableFactoryService.getInstance().createTable(
                `import-dialog-list-${this.objectType}`, this.objectType,
                configuration, null, this.context.getDescriptor().contextId,
                false, null, true
            );
            table.sort('CSV_LINE', SortOrder.UP);

            this.prepareTitle();

            this.tableSubscriber = {
                eventSubscriberId: 'import-table-listener',
                eventPublished: async (data: TableEventData, eventId: string) => {
                    if (data && this.state.table && data.tableId === this.state.table.getTableId()) {
                        if (eventId === TableEvent.TABLE_INITIALIZED || eventId === TableEvent.TABLE_READY) {
                            if (!!!this.selectedObjects.length) {
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
        const requiredPropertys = await this.state.importManager.getRequiredProperties();
        let columns: IColumnConfiguration[] = [
            new DefaultColumnConfiguration(
                'CSV_LINE', true, false, true, false, 60, true, true, false, DataType.NUMBER, false,
                null, 'Translatable#Zeilennr'
            )
        ];

        requiredPropertys.forEach((rp) => {
            const config = TableFactoryService.getInstance().getDefaultColumnConfiguration(
                this.objectType, rp
            );
            if (config) {
                columns.push(config);
            }
        });

        if (this.csvProperties && !!this.csvProperties.length) {
            this.csvProperties.filter((p) => !columns.some((c) => c.property === p)).forEach((ip) => {
                const config = TableFactoryService.getInstance().getDefaultColumnConfiguration(
                    this.objectType, ip
                );
                if (config) {
                    columns.push(config);
                }
            });
        }

        if (this.state.importManager && this.state.importManager.hasDefinedValues()) {
            const values = this.state.importManager.getEditableValues();
            values.filter((v) => v.operator !== ImportPropertyOperator.IGNORE)
                .map((v) => v.property).filter((p) => !columns.some((c) => c.property === p)).forEach((ip) => {
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
        const objectName = await LabelService.getInstance().getObjectName(this.objectType, true, false);
        const objectCount = this.state.importManager.objects.length;
        const tableTitle = await TranslationService.translate(
            'Translatable#Übersicht zu importierende {0} ({1})', [objectName, objectCount]
        );
        this.state.tableTitle = tableTitle;
    }

    private async prepareTableDataByCSV(): Promise<void> {
        this.errorObjects = [];
        this.finishedObjects = [];
        this.selectedObjects = [];
        const formInstance = await FormService.getInstance().getFormInstance(this.state.importConfigFormId);
        if (formInstance) {
            const source = await formInstance.getFormFieldValueByProperty('source');
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

                let ok = importString && !!importString.length
                    && valueSeparator && valueSeparator.valid
                    && textSeparator && textSeparator.valid;

                if (!ok && !!!importString.length) {
                    BrowserUtil.openErrorOverlay('Translatable#Can not use file (file is empty).');
                }

                if (ok) {
                    ok = await this.prepareImportData(
                        this.getCSVData(importString, valueSeparator.value, textSeparator.value[0])
                    );
                    if (ok) {
                        ok = await this.setTableColumns();
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
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, new ComponentContent('list-with-title',
                        {
                            title: 'Translatable#Rows with too less values' + ':',
                            list: lineErrors.map((i) => `Row ${i}.`)
                        }
                    ), 'Translatable#Error!', true
                );
            }
        } else {
            ok = false;
        }
        return ok;
    }

    private getCSVData(importString: string, valueseparatorKey: string[], textSeparatorKey: string): string[][] {
        const textSeparator = this.importConfigs.get('text_separator').find((v) => v.key === textSeparatorKey);
        const textSeparatorString = textSeparator && textSeparator.value ? textSeparator.value : "'";
        const valueseparators = this.importConfigs.get('value_separator').filter(
            (v) => valueseparatorKey.some((vsk) => vsk === v.key)
        );
        const valueseparatorString = valueseparators && !!valueseparators.length
            ? `[${valueseparators.map((vs) => vs.value).join('')}]` : ";";

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
                        list: unknownProperties
                    }
                ), 'Translatable#Error!', true
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
                    this.state.table.addColumns(newColumnConfigs);
                }
            }
        } else {
            ok = false;
        }
        return ok;
    }

    private async checkRequiredProperties(): Promise<boolean> {
        const requiredPropertys = await this.state.importManager.getRequiredProperties();
        const adjustableProperties = await this.state.importManager.getProperties();
        const missingProperties: string[] = [];
        requiredPropertys.filter((rp) => !adjustableProperties.some((ap) => ap[0] === rp)).forEach((rP) => {
            if (!this.csvProperties || !!!this.csvProperties.length || !this.csvProperties.some((a) => rP === a)) {
                missingProperties.push(rP);
            }
        });
        if (!!missingProperties.length) {
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, new ComponentContent('list-with-title',
                    {
                        title: 'Translatable#Can not use file (missing required properties):',
                        list: missingProperties
                    }
                ), 'Translatable#Error!', true
            );
        }
        return !!!missingProperties.length;
    }

    private async setContextObjects() {
        const objects = this.csvObjects && !!this.csvObjects
            ? this.csvObjects.map((o) => this.state.importManager.getObject(o)) : [];
        if (this.context) {
            if (objects.length) {
                if (this.state.importManager.hasDefinedValues()) {
                    const values = this.state.importManager.getEditableValues();
                    values.forEach((v) => {
                        objects.forEach((o) => {
                            switch (v.operator) {
                                case ImportPropertyOperator.REPLACE_EMPTY:
                                    if (
                                        typeof o[v.property] === 'undefined'
                                        || o[v.property] === null
                                        || o[v.property] === ''
                                    ) {
                                        o[v.property] = v.value;
                                    }
                                    break;
                                case ImportPropertyOperator.FORCE:
                                    o[v.property] = v.value;
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
            this.context.setObjectList(objects);
        }
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public submit(): void {
        if (this.state.run) {
            DialogService.getInstance().closeMainDialog();
        }
    }

    public async run(): Promise<void> {
        if (this.state.canRun) {
            this.cancelImportProcess = false;
            const objectName = await LabelService.getInstance().getObjectName(
                this.state.importManager.objectType, true, false
            );

            const objects = this.state.importManager.objects;

            const question = await TranslationService.translate(
                'Translatable#Sie importieren {0} {1}. Ausführen?', [objects.length, objectName]
            );
            BrowserUtil.openConfirmOverlay(
                'Translatable#Jetzt ausführen?',
                question,
                this.runImportManager.bind(this)
            );
        }
    }

    private async runImportManager(): Promise<void> {
        this.state.run = true;

        const objectName = await LabelService.getInstance().getObjectName(
            this.state.importManager.objectType, true, false
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
            let end;

            await this.state.importManager.execute(object, columns)
                .then(() => {
                    this.finishedObjects.push(object);
                    this.state.table.selectRowByObject(object, false);
                    this.state.table.setRowObjectValueState([object], ValueState.HIGHLIGHT_SUCCESS);
                })
                .catch(async (error) => {
                    this.errorObjects.push(object);
                    this.state.table.setRowObjectValueState([object], ValueState.HIGHLIGHT_ERROR);
                    DialogService.getInstance().setMainDialogLoading(true, 'Translatable#An error occurred.');
                    end = Date.now();
                    await this.handleObjectEditError(object, error);
                });

            if (this.cancelImportProcess) {
                break;
            }

            if (!end) {
                end = Date.now();
            }

            objectTimes.push(end - start);
            await this.setDialogLoadingInfo(objectTimes);
        }

        if (!this.errorObjects.length) {
            const succesText = await TranslationService.translate('Translatable#{0} imported', [objectName]);
            BrowserUtil.openSuccessOverlay(succesText);
        }

        DialogService.getInstance().setMainDialogLoading(false);
    }

    private async setDialogLoadingInfo(times: number[] = []): Promise<void> {
        const objectName = await LabelService.getInstance().getObjectName(
            this.state.importManager.objectType, true, false
        );
        const average = BrowserUtil.calculateAverage(times);
        const time = average * (
            this.state.importManager.objects.length - this.finishedObjects.length - this.errorObjects.length
        );
        const loadingHint = await TranslationService.translate(
            'Translatable#{0}/{1} {2} imported',
            [this.finishedObjects.length, this.state.importManager.objects.length, objectName]
        );
        DialogService.getInstance().setMainDialogLoading(
            true, loadingHint, false, time, this.cancelImport.bind(this)
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
                'Translatable#Zeile {0} in der bereit gestellten Datei mit {1} {2}: kann nicht importiert werden{3}. Wie möchten Sie weiter verfahren?',
                [object['CSV_LINE'], objectName, identifier, error ? ' (' + error.Message + ')' : '']
            );
            BrowserUtil.openConfirmOverlay(
                // tslint:disable-next-line:max-line-length
                `${objectName}: ${this.finishedObjects.length + this.errorObjects.length}/${this.state.importManager.objects.length}`,
                confirmText,
                () => { resolve(); },
                () => {
                    this.cancelImportProcess = true;
                    resolve();
                },
                ['Translatable#Ignore', 'Translatable#Cancel']
            );
        });
    }
}

module.exports = Component;
