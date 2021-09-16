/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class DataSource extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.REPORT_DATA_SOURCE;

    public Name: string;

    public DisplayName: string;

    public Description: string;

    public Options: any;

    public constructor(type?: DataSource) {
        super(type);

        if (type) {
            this.Name = type.Name;
            this.ObjectId = type.Name;
            this.DisplayName = type.DisplayName;
            this.Description = type.Description;
            this.Options = type.Options;
        }
    }

}
