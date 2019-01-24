import { AbstractAction, KIXObjectType, ContextMode } from "../../../../../model";
import { ContextService } from "../../../../context";

export class TranslationCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neue Übersetzung";
        this.icon = "kix-icon-gear";
    }

}
