/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TicketSearchContext } from '../context';

export class TicketSearchAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Search';
        this.icon = 'kix-icon-search';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setActiveContext(TicketSearchContext.CONTEXT_ID);
    }

}
