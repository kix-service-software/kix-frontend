import { WidgetComponentState, AbstractAction, Translation } from "../../../../../core/model";
import { TranslationLabelProvider } from "../../../../../core/browser/i18n";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: TranslationLabelProvider = null,
        public actions: AbstractAction[] = [],
        public translation: Translation = null
    ) {
        super();
    }

}
