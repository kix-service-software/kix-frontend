/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFactory } from '../../../server/model/ObjectFactory';
import { Queue } from '../model/Queue';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class QueueFactory extends ObjectFactory<Queue> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.QUEUE;
    }

    public async create(queue?: Queue): Promise<Queue> {
        return new Queue(queue);
    }


}
