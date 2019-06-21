import { AbstractAction, ContextMode, KIXObjectType } from "../../../../../model";
import { ContextService } from "../../../../context";
import { TranslationDetailsContext, EditTranslationDialogContext } from "../../context";

export class TranslationEditAction extends AbstractAction {

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
