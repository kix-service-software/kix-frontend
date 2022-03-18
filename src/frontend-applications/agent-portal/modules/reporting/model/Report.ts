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
import { ReportResult } from './ReportResult';

export class Report extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.REPORT;

    public ID: number;

    public DefinitionID: number;

    public Config: any;

    public Results: ReportResult[];

    public constructor(report?: Report) {
        super(report);

        if (report) {
            this.ID = report.ID;
            this.ObjectId = this.ID;
            this.DefinitionID = report.DefinitionID;
            this.Config = report.Config;
            this.Results = report.Results
                ? report.Results.map((t) => new ReportResult(t))
                : [];
        }
    }

}
