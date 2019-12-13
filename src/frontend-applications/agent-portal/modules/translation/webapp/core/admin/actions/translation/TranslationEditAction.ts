/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { TranslationDetailsContext, EditTranslationDialogContext } from "../../context";
import { AbstractAction } from "../../../../../../../modules/base-components/webapp/core/AbstractAction";
import { UIComponentPermission } from "../../../../../../../model/UIComponentPermission";
import { CRUD } from "../../../../../../../../../server/model/rest/CRUD";
import { ContextService } from "../../../../../../../modules/base-components/webapp/core/ContextService";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { ContextMode } from "../../../../../../../model/ContextMode";

export class TranslationEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/i18n/translations/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TranslationDetailsContext>(
            TranslationDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditTranslationDialogContext.CONTEXT_ID, KIXObjectType.TRANSLATION_PATTERN,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
