/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../../../modules/base-components/webapp/core/WidgetComponentState';
import { FAQArticle } from '../../../../model/FAQArticle';
import { Attachment } from '../../../../../../model/kix/Attachment';
import { InlineContent } from '../../../../../../modules/base-components/webapp/core/InlineContent';
import { AbstractAction } from '../../../../../../modules/base-components/webapp/core/AbstractAction';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public faqArticle: FAQArticle = null,
        public attachments: Attachment[] = [],
        public inlineContent: InlineContent[] = null,
        public actions: AbstractAction[] = [],
        public loading: boolean = true,
    ) {
        super();
    }

}
