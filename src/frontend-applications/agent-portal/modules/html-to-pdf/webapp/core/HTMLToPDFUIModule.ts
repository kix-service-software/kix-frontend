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
import { HTMLToPDFService } from './HTMLToPDFService';

export class UIModule implements IUIModule {

    public name: string = 'HTMLToPDFUIModule';

    public priority: number = 800;

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(HTMLToPDFService.getInstance());
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

}
