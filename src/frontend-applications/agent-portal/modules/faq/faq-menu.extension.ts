/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { FAQContext } from './webapp/core/context/FAQContext';
import { FAQDetailsContext } from './webapp/core/context/FAQDetailsContext';
import { IMainMenuExtension } from '../../server/extensions/IMainMenuExtension';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IMainMenuExtension {

    public mainContextId: string = FAQContext.CONTEXT_ID;

    public contextIds: string[] = [FAQContext.CONTEXT_ID, FAQDetailsContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = 'kix-icon-faq';

    public text: string = 'Translatable#FAQ';

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('faq/articles', [CRUD.READ])
    ];

    public orderRang: number = 400;

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
