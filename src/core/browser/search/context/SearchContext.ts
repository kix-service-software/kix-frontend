/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon } from "../../../model";
import { Context } from '../../../model/components/context/Context';
import { TranslationService } from "../../i18n/TranslationService";
import { SearchService } from "../../kix/search/SearchService";

export class SearchContext extends Context {

    public static CONTEXT_ID = 'search';

    public getIcon(): string | ObjectIcon {
        return "kix-icon-search";
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        const title = await TranslationService.translate('Translatable#Results advanced search');
        return title;
    }

    public reset(): void {
        super.reset();
        SearchService.getInstance().clearSearchCache();
    }

}
