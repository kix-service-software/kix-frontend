/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { GraphContext } from './GraphContext';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { GraphService } from './GraphService';

export class UIModule implements IUIModule {

    public priority: number = 10000;

    public name: string = 'GeneralCatalogUIModule';

    public async register(): Promise<void> {

        ServiceRegistry.registerServiceInstance(GraphService.getInstance());

        const graphContext = new ContextDescriptor(
            GraphContext.CONTEXT_ID, [KIXObjectType.GRAPH],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'graph-module', ['graph'], GraphContext,
            [
                new UIComponentPermission('cmdb/configitems', [CRUD.CREATE])
            ],
            'Translatable#Asset Graph', 'fas fa-project-diagram'
        );
        ContextService.getInstance().registerContext(graphContext);
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

}
