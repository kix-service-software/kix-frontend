/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { Article } from '../../../model/Article';
import { TicketService } from '../../core';

class Component {

    private state: ComponentState;

    private article: Article = null;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.article = input.article;
    }

    public onMount(): void {
        this.prepareContent();
    }

    public async prepareContent(): Promise<void> {
        if (this.article) {
            const prepareContent = await TicketService.getInstance().getPreparedArticleBodyContent(this.article);
            this.state.inlineContent = prepareContent[1];
            this.state.content = prepareContent[0];
            this.state.plainText = this.article.Body;
            this.state.show = true;
        }
    }
}

module.exports = Component;
