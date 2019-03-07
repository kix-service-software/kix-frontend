import { ComponentState } from './ComponentState';
import {
    ContextService, LabelService, FormService, WidgetService, TableFactoryService,
    TableConfiguration, IColumnConfiguration, TableHeaderHeight, TableRowHeight, TableEvent, TableEventData
} from '../../../../core/browser';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';
import { TabContainerEvent, DialogService, TabContainerEventData } from '../../../../core/browser/components';
import { ImportDialogContext, ImportService } from '../../../../core/browser/import';
import {
    KIXObjectType, ContextMode, Form, FormContext, FormField, FormFieldOption,
    FormFieldOptionsForDefaultSelectInput, TreeNode, FormFieldValue, WidgetType
} from '../../../../core/model';
import { FormGroup } from '../../../../core/model/components/form/FormGroup';

class Component {

    private state: ComponentState;
    private objectType: KIXObjectType;
    private tableSubscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        WidgetService.getInstance().setWidgetType('dynamic-form-field-group', WidgetType.GROUP);
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
                const objectName = labelProvider.getObjectName(true);

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
            }
        }
        await this.prepareImportConfigForm();
        this.state.loading = false;
        this.createTable();
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
    }

    private async prepareImportConfigForm(): Promise<void> {
        const formGroup = new FormGroup('Import configurations', [
            new FormField(
                'Quelle', 'source', 'attachment-input', true,
                // tslint:disable-next-line:max-line-length
                'CSV-Datei mit den zu importierenen Datensätzen. Ein Einfügen per Drag & Drop ist möglich. Bitte beachten Sie die maximale Dateigröße von 25 MB pro Datei.',
                [new FormFieldOption('MimeTypes', ['text/csv'])]
            ),
            new FormField(
                'Zeichensatz', 'character_set', 'default-select-input', true,
                'Wählen Sie den Zeichensatz der Quelle aus.',
                [
                    new FormFieldOption(FormFieldOptionsForDefaultSelectInput.NODES, [
                        new TreeNode('UTF_8', 'UTF 8'),
                        new TreeNode('ISO_1', 'ISO 8859-1'),
                        new TreeNode('ISO_14', 'ISO 8859-14'),
                        new TreeNode('ISO_15', 'ISO 8859-15')
                    ])
                ],
                new FormFieldValue('UTF_8')
            ),
            new FormField(
                'Trennoptionen', 'value_separator', 'default-select-input', true,
                'Wählen Sie die in der Quelle verwendeten Trennzeichen aus.',
                [
                    new FormFieldOption(FormFieldOptionsForDefaultSelectInput.NODES, [
                        new TreeNode('COMMA', ', (Komma)'),
                        new TreeNode('SEMICOLON', '; (Semikolon)'),
                        new TreeNode('COLON', ': (Doppelpunkt)'),
                        new TreeNode('DOT', '. (Punkt)'),
                        new TreeNode('TAB', '-> (Tabulator)')
                    ]),
                    new FormFieldOption(FormFieldOptionsForDefaultSelectInput.MULTI, true)
                ],
                new FormFieldValue('SEMICOLON')
            ),
            new FormField(
                'Texttrenner', 'text_separator', 'default-select-input', true,
                'Wählen Sie das in der Quelle verwendete Textbegrenzungszeichen aus.',
                [
                    new FormFieldOption(FormFieldOptionsForDefaultSelectInput.NODES, [
                        new TreeNode('DOUBLE', '" (Doppeltes Hochkomma)'),
                        new TreeNode('SINGLE', "' (Einfaches Hochkomma)")
                    ])
                ],
                new FormFieldValue('SINGLE')
            )
        ]);

        const form = new Form(
            'import-file-config', 'Import configuration',
            [formGroup], KIXObjectType.ANY, true, FormContext.NEW
        );
        this.state.formId = form.id;

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
                eventPublished: (data: TableEventData, eventId: string) => {
                    if (data && data.tableId === table.getTableId()) {
                        if (eventId === TableEvent.TABLE_INITIALIZED) {
                            table.selectAll();
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
                        // this.state.bulkManager.objects = objects;
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
        const columns: IColumnConfiguration[] = [];
        requiredPropertys.forEach((rp) => {
            const config = TableFactoryService.getInstance().getDefaultColumnConfiguration(
                this.objectType, rp
            );
            if (config) {
                columns.push(config);
            }
        });
        return columns;
    }

    private prepareTitle(): void {
        const objectName = LabelService.getInstance().getObjectName(this.objectType, true);
        const objectCount = this.state.table ? this.state.table.getSelectedRows().length : 0;
        this.state.tableTitle = `Übersicht zu importierende ${objectName} (${objectCount})`;
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }
}

module.exports = Component;
