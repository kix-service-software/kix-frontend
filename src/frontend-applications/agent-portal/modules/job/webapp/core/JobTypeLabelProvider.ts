/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { JobProperty } from '../../model/JobProperty';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { JobType } from '../../model/JobType';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';

export class JobTypeLabelProvider extends LabelProvider {

    public kixObjectType: KIXObjectType = KIXObjectType.JOB_TYPE;

    public isLabelProviderFor(jobType: JobType): boolean {
        return jobType instanceof JobType;
    }

    public async getObjectText(
        jobType: JobType, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return jobType.Name;
    }


    public async getDisplayText(
        jobType: JobType, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        return jobType.Name;
    }

    public getObjectIcon(jobType?: JobType): string | ObjectIcon {
        switch (jobType.Name) {
            case 'Ticket':
                return 'kix-icon-ticket';
            case 'ITSMConfigItem':
                return 'fas fa-archive';
            case 'Synchronisation':
                return 'kix-icon-arrow-refresh';
            case 'Reporting':
                return 'fas fa-chart-pie';
            default:
                return new ObjectIcon(null, KIXObjectType.JOB_TYPE, jobType.Name);
        }
    }
}
