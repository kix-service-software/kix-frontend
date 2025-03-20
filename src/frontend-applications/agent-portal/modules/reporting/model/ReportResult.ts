/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class ReportResult extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.REPORT_RESULT;

    public ID: number;

    public Content: string;

    public ContentSize: number;

    public ContentType: string;

    public Format: string;

    public ReportID: number;

    public constructor(reportResult?: ReportResult) {
        super(reportResult);

        if (reportResult) {
            this.ID = reportResult.ID;
            this.ObjectId = this.ID;
            this.Content = reportResult.Content;
            this.ContentSize = reportResult.ContentSize;
            this.ContentType = reportResult.ContentType;
            this.Format = reportResult.Format;
            this.ReportID = reportResult.ReportID;
        }
    }

}
