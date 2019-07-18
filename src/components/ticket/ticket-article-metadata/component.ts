/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketArticleMetadataComponentState } from './TicketArticleMetadataComponentState';
import { ArticleLabelProvider } from '../../../core/browser/ticket';

class TicketArticleMetadataComponent {

    private state: TicketArticleMetadataComponentState;

    public onCreate(): void {
        this.state = new TicketArticleMetadataComponentState();
        this.state.labelProvider = new ArticleLabelProvider();
    }

    public onInput(input: any): void {
        this.state.article = input.article;
    }

}

module.exports = TicketArticleMetadataComponent;
