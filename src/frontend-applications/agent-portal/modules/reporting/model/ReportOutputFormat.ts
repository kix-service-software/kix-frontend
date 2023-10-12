/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class ReportOutputFormat extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.REPORT_OUTPUT_FORMAT;

    public Name: string;

    public DisplayName: string;

    public Description: string;

    public Options: any;

    public constructor(outputFormat?: ReportOutputFormat) {
        super(outputFormat);

        if (outputFormat) {
            this.Name = outputFormat.Name;
            this.ObjectId = outputFormat.Name;
            this.DisplayName = outputFormat.DisplayName;
            this.Description = outputFormat.Description;
            this.Options = outputFormat.Options;
        }
    }

}
