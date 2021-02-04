/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { EditWebformDialogContext } from '../context/EditWebformDialogContext';
import { WebformDetailsContext } from '../context';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../../model/ContextMode';

export class WebformEditAction extends AbstractAction {

    public hasLink: boolean = true;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit Webform';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<WebformDetailsContext>(
            WebformDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditWebformDialogContext.CONTEXT_ID, KIXObjectType.WEBFORM,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
