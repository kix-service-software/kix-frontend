/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { PluginService } from './PluginService';
import { PluginLabelProvider } from './PluginLabelProvider';
import { PluginTableFactory } from './table';

export class UIModule implements IUIModule {

    public priority: number = 900;

    public name: string = 'PluginUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(PluginService.getInstance());

        TableFactoryService.getInstance().registerFactory(new PluginTableFactory());

        LabelService.getInstance().registerLabelProvider(new PluginLabelProvider());
    }

}
