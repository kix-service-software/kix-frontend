import { WidgetComponentState, AbstractAction, TranslationPattern } from '../../../../../core/model';
import { TranslationPatternLabelProvider } from '../../../../../core/browser/i18n';

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: TranslationPatternLabelProvider = null,
        public actions: AbstractAction[] = [],
        public translation: TranslationPattern = null
    ) {
        super();
    }

}
