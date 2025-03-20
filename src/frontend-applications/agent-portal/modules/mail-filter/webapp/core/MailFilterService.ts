/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { MailFilter } from '../../model/MailFilter';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class MailFilterService extends KIXObjectService<MailFilter> {

    private static INSTANCE: MailFilterService = null;

    public static getInstance(): MailFilterService {
        if (!MailFilterService.INSTANCE) {
            MailFilterService.INSTANCE = new MailFilterService();
        }

        return MailFilterService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.MAIL_FILTER);
        this.objectConstructors.set(KIXObjectType.MAIL_FILTER, [MailFilter]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.MAIL_FILTER;
    }

    public getLinkObjectName(): string {
        return 'MailFilter';
    }

}
