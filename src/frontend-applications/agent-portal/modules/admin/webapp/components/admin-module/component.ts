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
import { AdminModule } from '../../../model/AdminModule';
import { AdministrationSocketClient } from '../../core/AdministrationSocketClient';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { IdService } from '../../../../../model/IdService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
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

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                this.moduleChanged();
            }
        };

        EventService.getInstance().subscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
    }

    public async moduleChanged(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext() as AdminContext;
        const module = await AdministrationSocketClient.getInstance().getAdminModule(context.adminModuleId);
        if (module instanceof AdminModule) {
            this.state.template = KIXModulesService.getComponentTemplate(module.componentId);
        }
    }
}

module.exports = Component;
