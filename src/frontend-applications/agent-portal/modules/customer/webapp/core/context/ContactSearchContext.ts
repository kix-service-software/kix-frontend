/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { SearchContext } from '../../../../search/webapp/core';

export class ContactSearchContext extends Context {

    public static CONTEXT_ID: string = 'search-contact-context';

    public async getUrl(): Promise<string> {
        const context = await ContextService.getInstance().getContext<SearchContext>(SearchContext.CONTEXT_ID);
        const url = await context.getUrl();
        return url;
    }

}
