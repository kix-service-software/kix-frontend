/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../../model/ContextMode';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { NewQueueDialogContext } from './context/ticket-queue/NewQueueDialogContext';
import { QueueDetailsContext, EditQueueDialogContext } from './context';
import { Queue } from '../../../model/Queue';

export class QueueDialogUtil {

    public static async create(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewQueueDialogContext.CONTEXT_ID, KIXObjectType.QUEUE, ContextMode.CREATE, null, true, 'Translatable#Ticket'
        );
    }

    public static async edit(queueId?: string | number): Promise<void> {
        if (!queueId) {
            const context = await ContextService.getInstance().getContext<QueueDetailsContext>(
                QueueDetailsContext.CONTEXT_ID
            );

            if (context) {
                queueId = context.getObjectId();
            }
        }

        if (queueId) {
            ContextService.getInstance().setDialogContext(
                EditQueueDialogContext.CONTEXT_ID, KIXObjectType.QUEUE, ContextMode.EDIT_ADMIN, queueId
            );
        }
    }

    public static async duplicate(queue: Queue): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewQueueDialogContext.CONTEXT_ID, KIXObjectType.QUEUE, ContextMode.CREATE, queue.QueueID,
            false, 'Translatable#Ticket'
        );
    }

}
