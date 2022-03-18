/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { SearchContext } from '../../../../search/webapp/core';

export class ContactSearchContext extends SearchContext {

    public static CONTEXT_ID: string = 'search-contact-context';

    public getIcon(): string | ObjectIcon {
        return 'kix-icon-search-man-bubble';
    }

}
