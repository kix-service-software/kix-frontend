/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { InvalidObjectCSSHandler } from './css-handler/InvalidObjectCSSHandler';
import { ConfigurationType } from '../../../../model/configuration/ConfigurationType';
import { KIXModulesService } from '../../../base-components/webapp/core/KIXModulesService';
import { SwitchColumnOrderAction } from './actions/SwitchColumnOrderAction';
import { TableCSSHandlerRegistry } from './css-handler/TableCSSHandlerRegistry';

export class UIModule implements IUIModule {

    public name: string = 'TableUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public priority: number = 800;

    public async register(): Promise<void> {
        ActionFactory.getInstance().registerAction('switch-column-order-action', SwitchColumnOrderAction);
        TableCSSHandlerRegistry.getInstance().registerCommonCSSHandler(new InvalidObjectCSSHandler());

        KIXModulesService.getInstance().registerConfigurationComponent(
            ConfigurationType.TableWidget, 'table-widget-configuration'
        );

        KIXModulesService.getInstance().registerConfigurationComponent(
            ConfigurationType.Table, 'table-configuration'
        );
    }

}
