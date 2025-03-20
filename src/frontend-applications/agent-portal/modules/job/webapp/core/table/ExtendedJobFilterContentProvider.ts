/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { Job } from '../../../model/Job';
import { JobTypes } from '../../../model/JobTypes';

export abstract class ExtendedJobFilterContentProvider {

    public jobType: JobTypes | string = JobTypes.TICKET;

    public async getKey(displayKey: string, criterion: any, job: Job, criteria: any[]): Promise<string> {
        return displayKey;
    }

    public async getValues(displayKey: string, criterion: any, job: Job, criteria: any[]): Promise<[any, string]> {
        return [criterion.value, null];
    }

    public async getIcons(
        displayKey: string, criterion: any, job: Job, criteria: any[]
    ): Promise<Array<string | ObjectIcon>> {
        return [];
    }

}
