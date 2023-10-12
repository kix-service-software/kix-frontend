/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { SaveSearchAction, DeleteSearchAction, LoadSearchAction } from './actions';
import { SearchService } from './SearchService';

export class UIModule implements IUIModule {

    public priority: number = 9999;

    public name: string = 'SearchUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        const dialogs = await ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
        if (dialogs && dialogs.length) {
            ActionFactory.getInstance().registerAction('save-search-action', SaveSearchAction);
            ActionFactory.getInstance().registerAction('delete-search-action', DeleteSearchAction);
            ActionFactory.getInstance().registerAction('load-search-action', LoadSearchAction);
        }

        this.registerBookmarks();
    }

    private async registerBookmarks(): Promise<void> {
        await SearchService.getInstance().getSearchBookmarks(true);
    }

}
