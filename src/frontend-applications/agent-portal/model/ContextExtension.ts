/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from './Context';
import { AbstractAction } from '../modules/base-components/webapp/core/AbstractAction';
import { KIXObject } from './kix/KIXObject';
import { ContextPreference } from './ContextPreference';

export class ContextExtension {

    public async initContext(context: Context, urlParams?: URLSearchParams): Promise<void> {
        return;
    }

    public async getAdditionalActions(context: Context, object?: KIXObject): Promise<AbstractAction[]> {
        return;
    }

    public async addStorableAdditionalInformation(
        context: Context, contextPreference: ContextPreference
    ): Promise<void> {
        return;
    }

    public async loadAdditionalInformation(context: Context, contextPreference: ContextPreference): Promise<void> {
        return;
    }

}
