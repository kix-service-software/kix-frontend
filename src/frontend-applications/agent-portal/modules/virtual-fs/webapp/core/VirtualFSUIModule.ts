/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { VirtualFSService } from './VirtualFSService';

export class UIModule implements IUIModule {

    public name: string = 'VirtualFSUIModule';

    public priority: number = 5000;

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(VirtualFSService.getInstance());
    }

    registerExtensions(): Promise<void> {
        return null;
    }

    public async unRegister(): Promise<void> {
        return null;
    }

}