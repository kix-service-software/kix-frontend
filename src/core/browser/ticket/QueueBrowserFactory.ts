/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Queue } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class QueueBrowserFactory implements IKIXObjectFactory<Queue> {

    private static INSTANCE: QueueBrowserFactory;

    public static getInstance(): QueueBrowserFactory {
        if (!QueueBrowserFactory.INSTANCE) {
            QueueBrowserFactory.INSTANCE = new QueueBrowserFactory();
        }
        return QueueBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(queue: Queue): Promise<Queue> {
        return new Queue(queue);
    }

}
