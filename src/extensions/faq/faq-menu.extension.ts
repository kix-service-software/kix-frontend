/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMainMenuExtension } from '../../core/extensions';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { CRUD } from '../../core/model';
import { FAQContext } from '../../core/browser/faq/context/FAQContext';
import { FAQDetailsContext } from '../../core/browser/faq/context/FAQDetailsContext';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = FAQContext.CONTEXT_ID;

    public contextIds: string[] = [FAQContext.CONTEXT_ID, FAQDetailsContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-faq";

    public text: string = "Translatable#FAQ";

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('faq/articles', [CRUD.READ])
    ];

    public orderRang: number = 400;

}

module.exports = (data, host, options) => {
    return new Extension();
};
