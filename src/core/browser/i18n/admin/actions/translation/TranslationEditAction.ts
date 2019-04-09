import { AbstractAction, ContextMode, KIXObjectType, FormInstance, Translation, FormField } from "../../../../../model";
import { ContextService } from "../../../../context";
import { FormService } from "../../../../form";
import { TranslationDetailsContext } from "../../context";
import { FormFactory } from "../../../../form/FormFactory";

export class TranslationEditAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        const configuredForm = await FormService.getInstance().getForm('edit-translation-form');
        const form = { ...configuredForm };
        if (form) {
            FormFactory.initForm(form);
            const context = await ContextService.getInstance().getContext<TranslationDetailsContext>(
                TranslationDetailsContext.CONTEXT_ID
            );
            const translation = await context.getObject<Translation>();

            translation.Languages.forEach((l) => {
                const index = form.groups[0].formFields.findIndex((ff) => ff.property === l.Language);
                if (index === -1) {
                    form.groups[0].formFields.push(new FormField(
                        l.Language, l.Language, 'text-area-input', false,
                        `Geben Sie eine Übersetzung für die Sprache ${l.Language} ein.`
                    ));
                }
            });

            await FormService.getInstance().getFormInstance<FormInstance>('edit-translation-form', false, form);

            if (translation) {
                ContextService.getInstance().setDialogContext(
                    // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
                    null, KIXObjectType.TRANSLATION, ContextMode.EDIT_ADMIN, null, true
                );
            }
        }
    }

}
