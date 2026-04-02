/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ContextPreference } from '../../model/ContextPreference';
import { APIClient } from '../APIClient';
import { RequestMethod } from '../../../../server/model/rest/RequestMethod';

export class ContextAPIClient extends APIClient {

    public static async loadContextConfiguration(contextId: string): Promise<ContextConfiguration> {
        const response = await this.executeRequest(RequestMethod.GET, `/context/${contextId}/configuration`);
        const result = await response.json();
        return result.configuration;
    }

    public static async loadContextConfigurations(application: string): Promise<ContextConfiguration[]> {
        const response = await this.executeRequest(RequestMethod.GET, '/context/configurations', undefined, { application });
        const result = await response.json();
        return result.configurations;
    }

    public static async rebuildConfiguration(): Promise<void> {
        await this.executeRequest(RequestMethod.POST, '/context/configurations');
    }

    public static async loadStoredContexts(): Promise<ContextPreference[]> {
        const response = await this.executeRequest(RequestMethod.GET, '/context/store');
        const result = await response.json();
        return result.contextList;
    }

    public static async storeContext(contextPreference: ContextPreference): Promise<void> {
        await this.executeRequest(RequestMethod.POST, '/context/store', contextPreference);
    }

    public static async removeStoredContext(instanceId: string): Promise<void> {
        await this.executeRequest(RequestMethod.DELETE, `/context/store/${instanceId}`);
    }

}
