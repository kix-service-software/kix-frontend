/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AdditionalRoutingHandler } from '../../../base-components/webapp/core/AdditionalRoutingHandler';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { KIXModulesSocketClient } from '../../../base-components/webapp/core/KIXModulesSocketClient';
import { AgentService } from '../../../user/webapp/core/AgentService';

export class ReleaseRoutingHandler extends AdditionalRoutingHandler {

    private VISITED_KEY = 'KIXWebFrontendVisitedVersion';

    public constructor() {
        super(10);
    }

    public async handleRouting(): Promise<boolean> {
        let routed: boolean = false;

        const needReleaseInfo = await this.isReleaseInfoNeeded();
        if (needReleaseInfo) {
            await ContextService.getInstance().setActiveContext('release');

            const releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
            const buildNumber = releaseInfo ? releaseInfo.buildNumber : null;
            AgentService.getInstance().setPreferences([
                [this.VISITED_KEY, buildNumber.toString()]
            ]);
            routed = true;
        }

        return routed;
    }

    private async isReleaseInfoNeeded(): Promise<boolean> {
        let releaseInfoVisited: string;
        const currentUser = await AgentService.getInstance().getCurrentUser();
        if (currentUser && currentUser.Preferences) {
            const vistedVersion = currentUser.Preferences.find((p) => p.ID === this.VISITED_KEY);
            releaseInfoVisited = vistedVersion ? vistedVersion.Value : null;
        }

        const releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
        const buildNumber = releaseInfo ? releaseInfo.buildNumber : null;
        return !releaseInfoVisited || (buildNumber && releaseInfoVisited !== buildNumber.toString());
    }

}