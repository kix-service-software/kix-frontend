/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { JobType } from '../../model/JobType';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { LabelService } from '../../../base-components/webapp/core/LabelService';

export class JobTypeLabelProvider extends LabelProvider {

    public kixObjectType: KIXObjectType = KIXObjectType.JOB_TYPE;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof JobType || object?.KIXObjectType === this.kixObjectType;
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
        if (jobType) {
            switch (jobType.Name) {
                case 'Ticket':
                    return LabelService.getInstance().getObjectTypeIcon(KIXObjectType.TICKET) || 'kix-icon-ticket';
                case 'ITSMConfigItem':
                    return LabelService.getInstance().getObjectTypeIcon(KIXObjectType.CONFIG_ITEM) || 'fas fa-archive';
                case 'Synchronisation':
                    return 'kix-icon-arrow-refresh';
                case 'Reporting':
                    return 'fas fa-chart-pie';
                case 'Contact':
                    return LabelService.getInstance().getObjectTypeIcon(KIXObjectType.CONTACT) || 'kix-icon-man-bubble';
                default:
                    return new ObjectIcon(null, KIXObjectType.JOB_TYPE, jobType.Name);
            }
        }
        return;
    }
}
