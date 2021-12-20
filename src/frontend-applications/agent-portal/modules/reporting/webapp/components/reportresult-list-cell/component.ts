/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { Label } from '../../../../base-components/webapp/core/Label';
import { ReportingContext } from '../../core/context/ReportingContext';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { SortUtil } from '../../../../../model/SortUtil';
import { ReportResult } from '../../../model/ReportResult';
import { DataType } from '../../../../../model/DataType';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { Report } from '../../../model/Report';
import { ReportDefinition } from '../../../model/ReportDefinition';

import mimeTypes from 'mime-types';
import { DateTimeUtil } from '../../../../base-components/webapp/core/DateTimeUtil';
import { Attachment } from '../../../../../model/kix/Attachment';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const results: ReportResult[] = input.cell.getValue().objectValue;
        this.state.cellLabels = SortUtil.sortObjects(
            results.map((r) => new Label(
                r, r.ID, null, r.Format, null, Attachment.getHumanReadableContentSize(r.ContentSize), false
            )),
            'text', DataType.STRING
        );
    }

    public async download(label: Label, event: any): Promise<void> {
        const context: ReportingContext = ContextService.getInstance().getActiveContext();
        const reportResult: ReportResult = (label.object as ReportResult);
        const report: Report = (await context.getObjectList(KIXObjectType.REPORT)).find(
            (r) => r.ObjectId === reportResult.ReportID) as Report;
        const reportDefinition: ReportDefinition = (await context.getObjectList(KIXObjectType.REPORT_DEFINITION)).find(
            (rd) => rd.ObjectId === report.DefinitionID) as ReportDefinition;

        const resultWithContent = await context.loadReportResultWithContent(reportResult.ReportID, reportResult.ID);

        let fileExtension = mimeTypes.extension(reportResult.ContentType);
        if (!fileExtension) {
            const parts = reportResult.ContentType.split('/');
            if (Array.isArray(parts) && parts.length > 1) {
                fileExtension = parts[1];
            }
        }

        const currentDate = DateTimeUtil.format(new Date(report.CreateTime), 'yyyy-mm-dd_HHMMss');
        const fileName = `${reportDefinition.Name}_${currentDate}.${fileExtension}`;

        BrowserUtil.startBrowserDownload(fileName, resultWithContent.Content,
            resultWithContent.ContentType, true);
    }
}

module.exports = Component;
