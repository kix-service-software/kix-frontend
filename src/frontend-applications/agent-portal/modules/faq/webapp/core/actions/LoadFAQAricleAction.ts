/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FAQDetailsContext } from '../context/FAQDetailsContext';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';

export class LoadFAQAricleAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.icon = 'kix-icon-faq';
        this.text = 'Translatable#FAQ Article';
    }

    public async run(): Promise<void> {
        if (this.data) {
            ContextService.getInstance().setActiveContext(FAQDetailsContext.CONTEXT_ID, this.data);
        }
    }

}
