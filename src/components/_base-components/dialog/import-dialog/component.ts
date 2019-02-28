import { ComponentState } from './ComponentState';
import { ContextService, LabelService, FormService } from '../../../../core/browser';
import { EventService } from '../../../../core/browser/event';
import { TabContainerEvent, DialogService, TabContainerEventData } from '../../../../core/browser/components';
import { ImportDialogContext } from '../../../../core/browser/import';
import {
    KIXObjectType, ContextMode, Form, FormContext, FormField, FormFieldOption,
    FormFieldOptionsForDefaultSelectInput, TreeNode, FormFieldValue
} from '../../../../core/model';
import { FormGroup } from '../../../../core/model/components/form/FormGroup';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
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

                const labelProvider = LabelService.getInstance().getLabelProviderForType(infos[0] as KIXObjectType);
                const objectName = labelProvider.getObjectName(true);

                EventService.getInstance().publish(TabContainerEvent.CHANGE_TITLE, new TabContainerEventData(
                    'import-dialog', `${objectName} importieren`
                ));

                const dialogs = DialogService.getInstance().getRegisteredDialogs(ContextMode.CREATE);
                const dialog = dialogs.find((d) => d.kixObjectType === infos[0]);
                if (dialog) {
                    EventService.getInstance().publish(TabContainerEvent.CHANGE_ICON, new TabContainerEventData(
                        'import-dialog', null, dialog.configuration.icon
                    ));
                }
            }
        }
        const form = await this.prepareForm();
        this.state.loading = false;
    }

    private async prepareForm(): Promise<void> {

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
}

module.exports = Component;
