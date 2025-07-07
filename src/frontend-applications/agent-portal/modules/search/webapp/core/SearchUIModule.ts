/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { SearchService } from './SearchService';
import { SaveUserDefaultSearchAction } from './actions/SaveUserDefaultSearchAction';
import { SharedSearchEventHandler } from './SharedSearchEventHandler';
import { DeleteSearchAction } from './actions/DeleteSearchAction';
import { LoadSearchAction } from './actions/LoadSearchAction';
import { SaveSearchAction } from './actions/SaveSearchAction';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { ElasticSearchService } from './ElasticSearchService';
import { ElasticSearchContext } from './ElasticSearchContext';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';

export class UIModule implements IUIModule {

    public priority: number = 9999;

    public name: string = 'SearchUIModule';

    public async register(): Promise<void> {
        SharedSearchEventHandler.getInstance();
        const contextDescriptor = new ContextDescriptor(
            ElasticSearchContext.CONTEXT_ID, [KIXObjectType.ANY], ContextType.MAIN,
            ContextMode.DASHBOARD, false, 'elasticsearch-dashboard', ['elasticsearch'], ElasticSearchContext
        );
        ContextService.getInstance().registerContext(contextDescriptor);
    }

    public async registerExtensions(): Promise<void> {
        const dialogs = await ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
        if (dialogs && dialogs.length) {
            ActionFactory.getInstance().registerAction('save-search-action', SaveSearchAction);
            ActionFactory.getInstance().registerAction('delete-search-action', DeleteSearchAction);
            ActionFactory.getInstance().registerAction('load-search-action', LoadSearchAction);
            ActionFactory.getInstance().registerAction(
                'save-user-default-search-action', SaveUserDefaultSearchAction
            );
        }
        ServiceRegistry.registerServiceInstance(ElasticSearchService.getInstance());

        await SearchService.getInstance().getSearchBookmarks(true);
    }

}
