/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { ValidObjectLabelProvider } from './ValidObjectLabelProvider';
import { ValidService } from './ValidService';

export class UIModule implements IUIModule {

    public name: string = 'ValidUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public priority: number = 800;

    public async register(): Promise<void> {
        LabelService.getInstance().registerLabelProvider(new ValidObjectLabelProvider());
        ServiceRegistry.registerServiceInstance(ValidService.getInstance());
    }

}
