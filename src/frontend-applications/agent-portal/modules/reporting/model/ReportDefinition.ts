/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { report } from 'process';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { Report } from './Report';

export class ReportDefinition extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.REPORT_DEFINITION;

    public ID: number;

    public Token: string;

    public Name: string;

    public Comment: string;

    public Config: any;

    public Reports: Report[];

    public DataSource: string;

    public BaseURL: string;

    public IsPeriodic: number;

    public MaxReports: number;

    public constructor(reportDefinition?: ReportDefinition) {
        super(reportDefinition);

        if (reportDefinition) {
            this.ID = reportDefinition.ID;
            this.ObjectId = this.ID;
            this.DataSource = reportDefinition.DataSource;
            this.Name = reportDefinition.Name;
            this.Token = reportDefinition.Token;
            this.BaseURL = reportDefinition.BaseURL;
            this.Config = reportDefinition.Config;
            this.Comment = reportDefinition.Comment;
            this.IsPeriodic = reportDefinition.IsPeriodic;
            this.MaxReports = reportDefinition.MaxReports;
            this.Reports = reportDefinition.Reports
                ? reportDefinition.Reports.map((t) => new Report(t))
                : [];
        }
    }
}
