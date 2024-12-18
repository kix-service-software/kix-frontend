/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AdditionalContextInformation } from '../modules/base-components/webapp/core/AdditionalContextInformation';
import { Context } from './Context';
import { ContextPreference } from './ContextPreference';

export class ContextStorageManager {

    public constructor(protected context?: Context) { }

    public setContext(context: Context): void {
        this.context = context;
    }

    public async getStorableContextPreference(forceRemove?: boolean): Promise<ContextPreference> {
        const contextPreference = new ContextPreference(
            this.context.instanceId, this.context.getObjectId(), this.context.contextId
        );

        await this.context.addStorableAdditionalInformation(contextPreference);
        await this.context.getFormManager().addStorableValue(contextPreference);

        return contextPreference;
    }

    public async loadStoredValues(contextPreference: ContextPreference): Promise<void> {
        await this.context.loadAdditionalInformation(contextPreference);
        await this.context.getFormManager()?.loadStoredValue(contextPreference);
        this.context?.setAdditionalInformation(AdditionalContextInformation.IS_RESTORED, true);
    }

}
