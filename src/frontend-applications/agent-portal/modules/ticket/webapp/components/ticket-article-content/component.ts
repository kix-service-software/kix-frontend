/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
        this.state.useReadonlyStyle = typeof input.useReadonlyStyle !== 'undefined' ? input.useReadonlyStyle : true;
    }

    public onInput(input: any): void {
        if (this.article?.ChangeTime !== input.article?.ChangeTime) {
            this.article = input.article;
            this.prepareContent();
        }
    }

    public async prepareContent(): Promise<void> {
        if (this.article) {
            const prepareContent = await TicketService.getInstance().getPreparedArticleBodyContent(this.article);
            this.state.inlineContent = prepareContent[1];
            this.state.content = prepareContent[0];
            if (this.article.ContentType.startsWith('text/plain') && !this.article.bodyAttachment) {
                this.state.plainText = this.article.Body;
            }
        }
    }
}

module.exports = Component;
