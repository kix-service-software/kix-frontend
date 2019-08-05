/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
