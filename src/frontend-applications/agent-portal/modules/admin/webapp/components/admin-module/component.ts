/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { AdminContext } from '../../core/AdminContext';
import { ContextType } from '../../../../../model/ContextType';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { AdministrationSocketClient } from '../../core/AdministrationSocketClient';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { Context } from '../../../../../model/Context';

class Component extends AbstractMarkoComponent<ComponentState, AdminContext> {

    public onCreate(input: any): void {
        super.onCreate(input, 'admin-module');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        ContextService.getInstance().registerListener({
            constexServiceListenerId: 'admin-module-context-service-listener',
            contextChanged: (contextId: string, c: AdminContext, type: ContextType, history: boolean) => {
                if (contextId === AdminContext.CONTEXT_ID && c.adminModuleId) {
                    this.moduleChanged();
                }
            },
            contextRegistered: () => { return; },
            beforeDestroy: () => null
        });
        this.moduleChanged();

        super.registerEventSubscriber(
            function (data: Context, eventId: string): void {
                if (data?.instanceId === this.contextInstanceId) {
                    this.moduleChanged();
                }
            },
            [ContextEvents.CONTEXT_PARAMETER_CHANGED]
        );
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public async moduleChanged(): Promise<void> {
        const module = await AdministrationSocketClient.getInstance().getAdminModule(this.context?.adminModuleId);
        if (module && module.componentId) {
            this.state.template = KIXModulesService.getComponentTemplate(module.componentId);
        }
        else {
            this.state.template = KIXModulesService.getComponentTemplate('admin-object-tag');
        }
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
