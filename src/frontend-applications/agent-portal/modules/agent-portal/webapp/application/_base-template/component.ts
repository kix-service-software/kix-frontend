/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* eslint-disable max-lines-per-function */

import { ComponentState } from './ComponentState';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { RoutingService } from '../../../../../modules/base-components/webapp/core/RoutingService';
import { ClientStorageService } from '../../../../base-components/webapp/core/ClientStorageService';
import { IKIXModuleExtension } from '../../../../../model/IKIXModuleExtension';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { AgentPortalService } from '../../core/AgentPortalService';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private modules: IKIXModuleExtension[];

    public onCreate(input: any): void {
        super.onCreate(input, 'BASE-TEMPLATE');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        if (input && input.socketTimeout) {
            ClientStorageService.setSocketTimeout(input.socketTimeout);
            ClientStorageService.setBaseRoute(input.baseRoute || '');
        }

        this.modules = input.modules;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const start = Date.now();

        this.state.loading = true;
        this.state.loadingHint = 'Loading';

        await AgentPortalService.initApplication(this.modules);

        this.registerListener();

        RoutingService.getInstance().routeToInitialContext(true);

        this.state.initialized = true;
        this.state.loading = false;

        const end = Date.now();

        console.debug(`mount base template: ${end - start} ms.`);
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    private registerListener(): void {
        super.registerEventSubscriber(
            function (data: any, eventId: string): void {
                this.state.loading = data.loading;
                this.state.loadingHint = data.hint;
            },
            [ApplicationEvent.APP_LOADING]
        );

        super.registerEventSubscriber(
            function (data: any, eventId: string): void {
                this.state.applicationTemplate = KIXModulesService.getComponentTemplate(data?.componentId);
                this.state.applicationTemplateData = data?.data || {};
            },
            [ApplicationEvent.SWITCH_APPLICATION_TEMPLATE]
        );
    }
}

module.exports = Component;
