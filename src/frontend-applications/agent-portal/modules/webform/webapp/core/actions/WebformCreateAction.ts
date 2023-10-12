/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { NewWebformDialogContext } from '../context/NewWebformDialogContext';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';

export class WebformCreateAction extends AbstractAction {

    public hasLink: boolean = true;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Webform';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(): Promise<void> {
        ContextService.getInstance().setActiveContext(NewWebformDialogContext.CONTEXT_ID);
    }

}
