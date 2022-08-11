/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from 'vm';
import { ContextType } from '../../../../model/ContextType';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';

export interface IContextServiceListener {

    constexServiceListenerId: string;

    contextChanged(
        contextId: string, context: Context, type: ContextType, history: boolean, oldContext: Context
    ): void;

    contextRegistered(descriptor: ContextDescriptor): void;

    beforeDestroy(context: Context): Promise<void>;

}
