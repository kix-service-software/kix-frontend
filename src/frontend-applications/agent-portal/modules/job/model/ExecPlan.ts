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
import { ExecPlanParameter } from './ExecPlanParameter';

export class ExecPlan extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.EXEC_PLAN;

    public ID: number;

    public Name: string;

    public Type: string;

    public Parameters: ExecPlanParameter;

    public constructor(execPlan?: ExecPlan) {
        super(execPlan);
        if (execPlan) {
            this.ObjectId = execPlan.ID;
            this.ID = execPlan.ID;
            this.Name = execPlan.Name;
            this.Type = execPlan.Type;
            this.Parameters = execPlan.Parameters;
        }
    }

}
