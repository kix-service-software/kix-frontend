/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { ObjectFormValueMapper } from '../../model/ObjectFormValueMapper';

export abstract class ObjectCommitHandlerExtension<T extends KIXObject = KIXObject>{

    public constructor(protected objectValueMapper: ObjectFormValueMapper) { }

    public destroy(): void {
        return;
    }

    public async prepareObject(
        object: T, objectValueMapper?: ObjectFormValueMapper, forCommit?: boolean
    ): Promise<void> {
        return;
    }

    public async postCommitHandling(objectId: number | string): Promise<void> {
        return;
    }

    public async prepareTitle(object: T): Promise<void> {
        return;
    }

}