/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
            this.Reports = reportDefinition.Reports
                ? reportDefinition.Reports.map((t) => new Report(t))
                : [];
        }
    }
}
