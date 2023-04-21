/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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