/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { SearchContext } from '../SearchContext';
import { SearchService } from '../SearchService';

export class SaveUserDefaultSearchAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Set as Default';
        this.icon = 'kix-icon-star-fully';
    }

    public canRun(): boolean {
        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        const cache = context?.getSearchCache();
        return typeof cache !== 'undefined' && cache !== null;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const context = ContextService.getInstance().getActiveContext<SearchContext>();
            const cache = context?.getSearchCache();
            await SearchService.getInstance().setSearchCacheAsDefault(cache);
        }
    }

}
