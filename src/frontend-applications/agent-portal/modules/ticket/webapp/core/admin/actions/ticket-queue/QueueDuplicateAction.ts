/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../../base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../../../server/model/rest/CRUD';
import { QueueDialogUtil } from '../../QueueDialogUtil';
import { ContextService } from '../../../../../../base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { Queue } from '../../../../../model/Queue';

export class QueueDuplicateAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('system/ticket/queues', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Duplicate';
        this.icon = 'kix-icon-copy';
    }

    public async run(event: any): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const queue = await context.getObject<Queue>(KIXObjectType.QUEUE);
        if (queue) {
            QueueDialogUtil.duplicate(queue);
        }
    }

}
