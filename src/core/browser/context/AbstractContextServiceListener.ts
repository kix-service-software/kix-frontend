/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IContextServiceListener } from "./IContextServiceListener";
import { Context, ContextDescriptor } from "../../model";

export abstract class AbstractContextServiceListener implements IContextServiceListener {

    public contextChanged(contextId: string, context: Context): void {
        // do nothing
    }

    public contextRegistered(descriptor: ContextDescriptor): void {
        // do nothing
    }

}
