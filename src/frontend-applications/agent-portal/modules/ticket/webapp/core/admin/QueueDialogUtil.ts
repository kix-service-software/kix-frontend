/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { NewQueueDialogContext } from './context/ticket-queue/NewQueueDialogContext';
import { EditQueueDialogContext } from './context';
import { Queue } from '../../../model/Queue';

export class QueueDialogUtil {

    public static async create(): Promise<void> {
        ContextService.getInstance().setActiveContext(NewQueueDialogContext.CONTEXT_ID);
    }

    public static async edit(queueId?: string | number): Promise<void> {
        if (!queueId) {
            const context = ContextService.getInstance().getActiveContext();

            if (context) {
                queueId = context.getObjectId();
            }
        }

        if (queueId) {
            ContextService.getInstance().setActiveContext(EditQueueDialogContext.CONTEXT_ID, queueId);
        }
    }

    public static async duplicate(queue: Queue): Promise<void> {
        ContextService.getInstance().setActiveContext(NewQueueDialogContext.CONTEXT_ID, queue.QueueID);
    }

}
