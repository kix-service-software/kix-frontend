/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { OverlayService } from '../../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../base-components/webapp/core/OverlayType';
import { StringContent } from '../../../../base-components/webapp/core/StringContent';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ImportExportTemplateRunProperty } from '../../../model/ImportExportTemplateRunProperty';
import { ImportExportTemplateRunTypes } from '../../../model/ImportExportTemplateRunTypes';
import { CreateImportExportTemplateRunOptions } from '../../../model/CreateImportExportTemplateRunOptions';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { ImportExportTemplate } from '../../../model/ImportExportTemplate';
import { ConfigItemClass } from '../../../../cmdb/model/ConfigItemClass';

export class TemplateExportAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Export';
        this.icon = 'kix-icon-export';
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
            this.executeTemplateExport(selectedRows[0].getRowObject().getObject());
        }
    }

    private async executeTemplateExport(template: ImportExportTemplate): Promise<void> {
        if (template) {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Export data' }
            );
            await KIXObjectService.createObject(
                KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN,
                [
                    [ImportExportTemplateRunProperty.TYPE, ImportExportTemplateRunTypes.EXPORT]
                ],
                new CreateImportExportTemplateRunOptions(Number(template.ID)),
                false
            ).then(async (result) => {
                const fileName = await this.getFileName(template);
                this.startFileDownload(result, fileName);
            }).catch((error: Error) => {
                const content = new StringContent(
                    'Translatable#An error occured during export execution. See system log for details.'
                );
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                );
            });

            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
        }
    }

    private async getFileName(template: ImportExportTemplate): Promise<string> {
        let fileName = template.Name;
        if (template && template.ObjectData) {
            // TODO: get name dynamically per service
            if (template.Object === 'ITSMConfigItem' && template.ObjectData.ClassID) {
                const classes = await KIXObjectService.loadObjects<ConfigItemClass>(
                    KIXObjectType.CONFIG_ITEM_CLASS, [template.ObjectData.ClassID], null, null, true
                ).catch(() => [] as ConfigItemClass[]);
                if (classes && classes.length) {
                    fileName = classes[0].Name.replace(/ +/g, '');
                }
            }
        }
        return fileName;
    }

    private startFileDownload(contentString: string, fileName: string): void {
        const fileContent = Buffer.from(contentString, 'base64').toString('utf8');
        BrowserUtil.downloadCSVFile(fileContent, fileName);
    }
}
