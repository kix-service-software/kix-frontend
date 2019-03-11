import { ComponentState } from './ComponentState';
import {
    ContextService, LabelService, FormService, WidgetService, TableFactoryService,
    TableConfiguration, IColumnConfiguration, TableHeaderHeight, TableRowHeight,
    TableEvent, TableEventData, BrowserUtil, OverlayService, DefaultColumnConfiguration
} from '../../../../core/browser';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';
import { TabContainerEvent, TabContainerEventData } from '../../../../core/browser/components';
import { ImportDialogContext, ImportService, ImportPropertyOperator } from '../../../../core/browser/import';
import {
    KIXObjectType, ContextMode, Form, FormContext, FormField, FormFieldOption,
    FormFieldOptionsForDefaultSelectInput, TreeNode, FormFieldValue, WidgetType,
    KIXObject, OverlayType, ComponentContent, DataType, SortOrder
} from '../../../../core/model';
import { FormGroup } from '../../../../core/model/components/form/FormGroup';
import { ImportConfigValue } from './ImportConfigValue';
import { DialogService } from '../../../../core/browser/components/dialog';

class Component {

    private state: ComponentState;
    private objectType: KIXObjectType;
    private tableSubscriber: IEventSubscriber;
    private formListenerId: string;
    private importConfigs: Map<string, ImportConfigValue[]> = new Map();
    private csvObjects: any[];
    private csvProperties: string[];
    private attributeFormProperties: string[];

    private propertiesFormTimeout;

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
                        new ImportConfigValue('COMMA', ', (Komma)', ','),
                        new ImportConfigValue('SEMICOLON', '; (Semikolon)', ';'),
                        new ImportConfigValue('COLON', ': (Doppelpunkt)', ':'),
                        new ImportConfigValue('DOT', '. (Punkt)', '.'),
                        new ImportConfigValue('TAB', '-> (Tabulator)', '\\t')
                    ]
                ],
                [
                    'text_separator', [
                        new ImportConfigValue('DOUBLE', '" (Doppeltes Hochkomma)', '"'),
                        new ImportConfigValue('SINGLE', "' (Einfaches Hochkomma)", "'")
                    ]
                ]
            ]
        );
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<ImportDialogContext>(
            ImportDialogContext.CONTEXT_ID
        );
        if (context) {
            const infos = await context.getAdditionalInformation();
            if (infos && !!infos.length && typeof infos[0] === 'string' && infos[0].length) {
                this.objectType = infos[0] as KIXObjectType;

                const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
                const objectName = await labelProvider.getObjectName(true);

                EventService.getInstance().publish(TabContainerEvent.CHANGE_TITLE, new TabContainerEventData(
                    'import-dialog', `${objectName} importieren`
                ));

                const dialogs = DialogService.getInstance().getRegisteredDialogs(ContextMode.CREATE);
                const dialog = dialogs.find((d) => d.kixObjectType === this.objectType);
                if (dialog) {
                    EventService.getInstance().publish(TabContainerEvent.CHANGE_ICON, new TabContainerEventData(
                        'import-dialog', null, dialog.configuration.icon
                    ));
                }

                const importManager = ImportService.getInstance().getImportManager(this.objectType);
                importManager.init();
                this.state.importManager = importManager;

                this.formListenerId = `import-form-listener-${this.objectType}`;
                this.state.importManager.registerListener(this.formListenerId, () => {
                    if (!this.propertiesFormTimeout) {
                        this.propertiesFormTimeout = setTimeout(async () => {
                            this.propertiesFormTimeout = null;
                            await this.setTableColumns();
                            await this.setContextObjects();
                        }, 200);
                    }
                });
            }
        }
        await this.prepareImportConfigForm();

        if (this.objectType) {
            await FormService.getInstance().registerFormInstanceListener(this.state.importConfigFormId, {
                formListenerId: this.formListenerId,
                formValueChanged: async (formField: FormField, value: FormFieldValue<any>) => {
                    await this.prepareTableDataByCSV();
                },
                updateForm: () => { return; }
            });
        }

        this.createTable();
        this.state.loading = false;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        FormService.getInstance().removeFormInstanceListener(this.state.importConfigFormId, this.formListenerId);
        FormService.getInstance().deleteFormInstance(this.state.importConfigFormId);
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
        if (this.state.importManager) {

            const configuration = new TableConfiguration(
                this.objectType, null, null, await this.getColumnConfig(),
                null, true, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
            const table = TableFactoryService.getInstance().createTable(
                `import-dialog-list-${this.objectType}`, this.objectType,
                configuration, null, ImportDialogContext.CONTEXT_ID,
                false, null, true
            );

            this.prepareTitle();

            this.tableSubscriber = {
                eventSubscriberId: 'import-table-listener',
                eventPublished: async (data: TableEventData, eventId: string) => {
                    if (data && this.state.table && data.tableId === this.state.table.getTableId()) {
                        if (eventId === TableEvent.TABLE_INITIALIZED || eventId === TableEvent.TABLE_READY) {
                            if (!!!this.state.table.getSelectedRows().length) {
                                this.state.table.selectAll();
                            }
                        }
                        // if (eventId === TableEvent.TABLE_READY
                        //     && (!!this.errorObjects.length || !!this.finishedObjects.length)
                        // ) {
                        //     this.state.table.setRowObjectValueState(this.errorObjects, ValueState.HIGHLIGHT_ERROR);
                        //     this.state.table.setRowObjectValueState(
                        //         this.finishedObjects, ValueState.HIGHLIGHT_SUCCESS
                        //     );
                        // }
                        // const rows = this.state.table.getSelectedRows();
                        // const objects = rows.map((r) => r.getRowObject().getObject());
                        // this.state.importManager.objects = objects;
                        // this.state.canRun = this.state.bulkManager.hasDefinedValues() && !!objects.length;
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
                null, 'Zeilennr'
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

        if (this.csvProperties && !!this.csvProperties) {
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

    private prepareTitle(): void {
        const objectName = LabelService.getInstance().getObjectName(this.objectType, true);
        const objectCount = this.state.table ? this.state.table.getSelectedRows().length : 0;
        this.state.tableTitle = `Translatable#Übersicht zu importierende ${objectName} (${objectCount})`;
    }

    private async prepareTableDataByCSV(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.importConfigFormId);
        if (formInstance) {
            DialogService.getInstance().setMainDialogLoading(true, "Datei wird eingelesen.");
            const source = await formInstance.getFormFieldValueByProperty('source');
            if (source && source.valid && source.value && Array.isArray(source.value) && !!source.value) {
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
                    BrowserUtil.openErrorOverlay('Datei konnte nicht geladen werden. (File is empty!)');
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
            DialogService.getInstance().setMainDialogLoading(false);
            await this.setContextObjects();
        }
    }

    private async prepareImportData(list: string[][]): Promise<boolean> {
        this.csvObjects = [];
        this.csvProperties = [];

        const csvProperties = list.shift();

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
                            title: 'Rows with too less values:',
                            list: lineErrors.map((i) => `Row ${i}.`)
                        }
                    ), 'Fehler!', true
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
            BrowserUtil.openErrorOverlay('Datei konnte nicht geladen werden. (No known properties found!)');
            ok = false;
        } else if (!!unknownProperties.length) {
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, new ComponentContent('list-with-title',
                    {
                        title: 'Unknown properties (will be ignored):',
                        list: unknownProperties
                    }
                ), 'Fehler!', true
            );
        }
        return ok;
    }

    private async setTableColumns(): Promise<boolean> {
        let ok: boolean = true;
        if (await this.checkRequiredProperties()) {
            const knownProperties = await this.state.importManager.getKnownProperties();
            this.csvProperties = this.csvProperties.filter((ip) => knownProperties.some((kn) => kn === ip));
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
        const missingProperties: string[] = [];
        requiredPropertys.forEach((rP) => {
            if (!this.csvProperties.some((a) => rP === a)) {
                missingProperties.push(rP);
            }
        });
        if (!!missingProperties.length) {
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, new ComponentContent('list-with-title',
                    {
                        title: 'Datei konnte nicht geladen werden. (Missing required properties):',
                        list: missingProperties
                    }
                ), 'Fehler!', true
            );
        }
        return !!!missingProperties.length;
    }

    private async setContextObjects() {
        const context = await ContextService.getInstance().getContext<ImportDialogContext>(
            ImportDialogContext.CONTEXT_ID
        );
        const objects = this.csvObjects && !!this.csvObjects
            ? this.csvObjects.map((o) => {
                const object = this.state.importManager.getObject(o);
                object['CSV_LINE'] = o['CSV_LINE'];
                return object;
            }) : [];
        if (context) {
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
            context.setObjectList(objects);
        }
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }
}

module.exports = Component;
