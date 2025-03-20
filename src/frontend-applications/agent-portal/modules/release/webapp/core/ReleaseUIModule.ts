/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ReleaseContext } from './ReleaseContext';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { RoutingService } from '../../../base-components/webapp/core/RoutingService';
import { ReleaseRoutingHandler } from './ReleaseRoutingHandler';

export class UIModule implements IUIModule {

    public priority: number = 9800;

    public name: string = 'ReleaseUIModule';

    public async register(): Promise<void> {
        const releaseContext = new ContextDescriptor(
            ReleaseContext.CONTEXT_ID, [KIXObjectType.ANY], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'release-module', ['release'], ReleaseContext
        );
        ContextService.getInstance().registerContext(releaseContext);
    }

    public async registerExtensions(): Promise<void> {
        RoutingService.getInstance().registerRoutingHandler(new ReleaseRoutingHandler());
    }

}
