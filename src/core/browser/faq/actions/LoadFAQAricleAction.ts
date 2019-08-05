/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction, KIXObjectType, ContextMode } from "../../../model";
import { ContextService } from "../../context";
import { FAQDetailsContext } from "../context/FAQDetailsContext";

export class LoadFAQAricleAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.icon = 'kix-icon-faq';
        this.text = 'Translatable#FAQ Article';
    }

    public async run(): Promise<void> {
        if (this.data) {
            ContextService.getInstance().setContext(
                FAQDetailsContext.CONTEXT_ID, KIXObjectType.FAQ_ARTICLE, ContextMode.DETAILS, this.data
            );
        }
    }

}
