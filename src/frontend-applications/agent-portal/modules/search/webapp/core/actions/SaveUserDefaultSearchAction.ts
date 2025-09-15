/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { SearchContext } from '../SearchContext';
import { SearchService } from '../SearchService';

export class SaveUserDefaultSearchAction extends AbstractAction<any, SearchContext> {

    public async initAction(): Promise<void> {
        await super.initAction();
        this.text = 'Translatable#Set as Default';
        this.icon = 'kix-icon-star-fully';
    }

    public canRun(): boolean {
        if (this.context instanceof SearchContext) {
            const cache = this.context.getSearchCache();
            return typeof cache !== 'undefined' && cache !== null;
        }
        return false;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const cache = this.context?.getSearchCache();
            await SearchService.getInstance().setSearchCacheAsDefault(cache);
        }
    }

}
