/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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

    public async postInitContext(context: Context): Promise<void> {
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

    public async addExtendedUrlParams(url: string): Promise<string> {
        return url;
    }

    public async destroy(context: Context): Promise<void> {
        return;
    }

}
