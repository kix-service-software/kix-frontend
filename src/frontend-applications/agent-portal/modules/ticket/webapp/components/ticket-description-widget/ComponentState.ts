/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../../modules/base-components/webapp/core/WidgetComponentState';
import { Article } from '../../../model/Article';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { Ticket } from '../../../model/Ticket';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public ticketId: number = null,
        public firstArticle: Article = null,
        public ticketNotes: string = null,
        public actions: AbstractAction[] = [],
        public ticket: Ticket = null,
        public loading: boolean = true
    ) {
        super();
    }

}
