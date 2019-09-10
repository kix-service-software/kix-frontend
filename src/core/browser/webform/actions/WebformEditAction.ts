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
import { EditWebformDialogContext } from "../context/EditWebformDialogContext";
import { WebformDetailsContext } from "../context";

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
