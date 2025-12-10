/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { AdminContext } from '../../../admin/webapp/core/AdminContext';
import { AdministrationSocketClient } from '../../../admin/webapp/core/AdministrationSocketClient';
import { AdditionalRoutingHandler } from '../../../base-components/webapp/core/AdditionalRoutingHandler';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { SetupService } from './SetupService';

export class SetupAssistentRoutingHandler extends AdditionalRoutingHandler {

    public constructor() {
        super(20);
    }

    public async handleRouting(): Promise<boolean> {
        let routed: boolean = false;
        const isSetupNeeded = await this.isSetupNeeded();

        if (isSetupNeeded) {
            routed = await this.routeToSetupAssistant();
            if (!routed) {
                ContextService.getInstance().registerListener({
                    constexServiceListenerId: 'SetupAssistentRoutingHandlerListener',
                    contextChanged: () => null,
                    contextRegistered: (descriptor: ContextDescriptor) => {
                        if (descriptor.contextId === AdminContext.CONTEXT_ID) {
                            this.routeToSetupAssistant();
                            ContextService.getInstance().unregisterListener('SetupAssistentRoutingHandlerListener');
                        }
                    },
                    beforeDestroy: () => null
                });
            }
        }

        return routed;
    }

    private async isSetupNeeded(): Promise<boolean> {
        let isSetupNeeded = false;
        const adminDescriptor = ContextService.getInstance().getContextDescriptor(AdminContext.CONTEXT_ID);
        if (adminDescriptor) {
            const setupModule = await AdministrationSocketClient.getInstance().getAdminModule('setup-assistant');
            if (setupModule) {
                const steps = await SetupService.getInstance().getSetupSteps();
                isSetupNeeded = steps.some((s) => !s.completed && !s.skipped);
            }
        }
        return isSetupNeeded;
    }

    private async routeToSetupAssistant(): Promise<boolean> {
        let routed = false;
        await ContextService.getInstance().setActiveContext(AdminContext.CONTEXT_ID);
        const context = ContextService.getInstance().getActiveContext();
        if (context instanceof AdminContext) {
            context.setAdminModule('setup-assistant');
            routed = true;
        }
        return routed;
    }

}