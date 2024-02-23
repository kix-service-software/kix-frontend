/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { RoutingService } from '../../../base-components/webapp/core/RoutingService';
import { SetupAssistentRoutingHandler } from './SetupAssistentRoutingHandler';

export class UIModule implements IUIModule {

    public priority: number = 1;

    public name: string = 'SetupAssistant';

    public async register(): Promise<void> {
        RoutingService.getInstance().registerRoutingHandler(new SetupAssistentRoutingHandler());
    }

    public async unRegister(): Promise<void> {
        return;
    }
}
