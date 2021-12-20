/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../base-components/webapp/core/AbstractAction';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { Row } from '../../../../table/model/Row';
import { ImportExportTemplate } from '../../../model/ImportExportTemplate';
import { AttachmentUtil } from '../../../../base-components/webapp/core/AttachmentUtil';
import { AttachmentError } from '../../../../../model/AttachmentError';
import { OverlayService } from '../../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../base-components/webapp/core/OverlayType';
import { StringContent } from '../../../../base-components/webapp/core/StringContent';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { ComponentContent } from '../../../../base-components/webapp/core/ComponentContent';
import { ToastContent } from '../../../../base-components/webapp/core/ToastContent';
import { ImportExportTemplateRunProperty } from '../../../model/ImportExportTemplateRunProperty';
import { ImportExportTemplateRunTypes } from '../../../model/ImportExportTemplateRunTypes';
import { CreateImportExportTemplateRunOptions } from '../../../model/CreateImportExportTemplateRunOptions';

export class TemplateImportAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Import';
        this.icon = 'kix-icon-import';
    }

    public canRun(): boolean {
        let canRun: boolean = false;
        if (this.data) {
            const selectedRows = this.data.getSelectedRows();
            canRun = selectedRows && selectedRows.length === 1;
        }
        return canRun;
    }

    public async run(): Promise<void> {
        if (this.canRun() && this.data.getObjectType() === KIXObjectType.IMPORT_EXPORT_TEMPLATE) {
            const selectedRows: Row[] = this.data.getSelectedRows();
            this.executeTemplateFileUpload(selectedRows[0].getRowObject().getObject());
        }
    }

    private async executeTemplateFileUpload(template: ImportExportTemplate): Promise<void> {
        if (template) {
            document.body.insertAdjacentHTML(
                'beforeend', '<input id="template-import-execute" type="file" style="display: none;"/>'
            );
            const uploadInput = document.getElementById('template-import-execute');
            if (uploadInput) {
                uploadInput.addEventListener('change', this.checkAndExecute.bind(this, template.ID), false);
                uploadInput.click();
            }
        }
    }
    private async checkAndExecute(templateId: number): Promise<void> {
        const uploadInput: any = document.getElementById('template-import-execute');
        if (templateId && uploadInput && uploadInput.files) {
            const importFile: any = Array.from(uploadInput.files)[0];
            if (importFile) {
                document.body.removeChild(uploadInput);
                let fileError = await AttachmentUtil.checkFile(
                    importFile, ['application/vnd.ms-excel', 'text/plain', 'text/csv', '']
                );
                if (!fileError && importFile.name.match(new RegExp('^.+\..+$'))) {
                    if (!importFile.name.match(new RegExp('\.(csv|txt)$'))) {
                        fileError = AttachmentError.INVALID_MIMETYPE;
                    }
                }
                if (!fileError) {
                    const fileContent = await BrowserUtil.readFile(importFile);
                    this.executeImport(fileContent, templateId);
                } else {
                    this.showError(importFile, fileError);
                }
            }
        }
    }

    private async executeImport(fileContent: string, templateId: number): Promise<void> {
        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Import will be started' }
        );
        await KIXObjectService.createObject(
            KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN,
            [
                [ImportExportTemplateRunProperty.TYPE, ImportExportTemplateRunTypes.IMPORT],
                [ImportExportTemplateRunProperty.EXEC_IMPORT_CONTENT, fileContent]
            ],
            new CreateImportExportTemplateRunOptions(templateId),
            false
        ).then(() => {
            const content = new ComponentContent(
                'toast',
                new ToastContent('kix-icon-check', 'Translatable#Import successfully started.')
            );
            OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
        }).catch((error: Error) => {
            const content = new StringContent(
                'Translatable#An error occured during import start execution. See system log for details.'
            );
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
            );
        });

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
    }

    private async showError(file: File, fileError: AttachmentError): Promise<void> {
        const errorMessages = await AttachmentUtil.buildErrorMessages([[file, fileError]]);

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING,
            null,
            new StringContent(errorMessages[0]),
            'Translatable#Error!',
            null, true
        );
    }
}
