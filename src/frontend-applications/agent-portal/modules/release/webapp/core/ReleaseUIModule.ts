/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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

        RoutingService.getInstance().registerRoutingHandler(new ReleaseRoutingHandler());

        const releaseContext = new ContextDescriptor(
            ReleaseContext.CONTEXT_ID, [KIXObjectType.ANY], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'release-module', ['release'], ReleaseContext
        );
        ContextService.getInstance().registerContext(releaseContext);
    }

    public unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

}
