/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { ContextUIEvent } from '../../../../base-components/webapp/core/ContextUIEvent';
import { ReportProperty } from '../../../model/ReportProperty';
import { ReportResult } from '../../../model/ReportResult';
import { ReportResultProperty } from '../../../model/ReportResultProperty';
import { Report } from '../../../model/Report';
import { ReportDefinition } from '../../../model/ReportDefinition';
import { ReportResultLoadingOptions } from '../../../model/ReportResultLoadingOptions';
import { ReportDefinitionProperty } from '../../../model/ReportDefinitionProperty';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';
import { SortOrder } from '../../../../../model/SortOrder';

export class ReportingContext extends Context {

    public static CONTEXT_ID: string = 'reporting';

    public async update(urlParams: URLSearchParams): Promise<void> {
        await this.loadReportDefinitions();
    }

    public getIcon(): string {
        return 'kix-icon-kpi';
    }

    public async getDisplayText(): Promise<string> {
        return await TranslationService.translate('Translatable#Reporting');
    }

    public setFilteredObjectList(objectType: KIXObjectType, filteredObjectList: KIXObject[]): void {
        super.setFilteredObjectList(objectType, filteredObjectList);

        if (objectType === KIXObjectType.REPORT_DEFINITION) {
            this.loadReports();
        }
    }

    public async loadReportDefinitions(): Promise<void> {
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS, KIXObjectType.REPORT_DEFINITION);
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [ReportDefinitionProperty.REPORTS, ReportProperty.RESULTS]
        );
        const definitions = await KIXObjectService.loadObjects(KIXObjectType.REPORT_DEFINITION, null, loadingOptions)
            .catch((error) => []);

        this.setObjectList(KIXObjectType.REPORT_DEFINITION, definitions);
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS_FINISHED, KIXObjectType.REPORT_DEFINITION);
    }

    public async loadReports(): Promise<void> {
        let reports = [];

        const definitions = this.getFilteredObjectList<ReportDefinition>(KIXObjectType.REPORT_DEFINITION);
        if (Array.isArray(definitions)) {
            for (const definition of definitions) {
                const reportList = definition.Reports;
                reports = Array.isArray(reportList) ? reports.concat(reportList) : reports;
            }
        }
        reports = SortUtil.sortObjects(reports, ReportProperty.CREATE_TIME, DataType.DATE_TIME, SortOrder.DOWN);
        this.setObjectList(KIXObjectType.REPORT, reports);
    }

    public async loadReportResultWithContent(reportId: number, resultId: number): Promise<ReportResult> {
        let result: ReportResult;

        // get the report for this result to get the DefinitionID
        const reportList = await this.getObjectList<Report>(KIXObjectType.REPORT).catch(() => []);
        const report = reportList?.find((r) => r.ID === reportId);

        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, [ReportResultProperty.CONTENT]);
        const reportLoadingOptions = new ReportResultLoadingOptions(report.DefinitionID, reportId);
        const resultList = await KIXObjectService.loadObjects<ReportResult>(
            KIXObjectType.REPORT_RESULT, [resultId], loadingOptions, reportLoadingOptions
        );

        if (Array.isArray(resultList) && resultList.length) {
            result = resultList[0];
        }

        return result;
    }

    public async reloadObjectList(objectType: KIXObjectType | string): Promise<void> {
        if (objectType === KIXObjectType.REPORT) {
            await this.loadReportDefinitions();
            return this.loadReports();
        } else if (objectType === KIXObjectType.REPORT_DEFINITION) {
            return this.loadReportDefinitions();
        }
    }

}
