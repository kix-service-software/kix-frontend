/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { Article } from '../../../model/Article';
import { TicketService } from '../../core';
import { ClientStorageService } from '../../../../base-components/webapp/core/ClientStorageService';
import { IdService } from '../../../../../model/IdService';

class Component {

    private state: ComponentState;

    private article: Article = null;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.state.frameId = IdService.generateDateBasedId('article-view-');
    }

    public onInput(input: any): void {
        if (this.article?.ChangeTime !== input.article?.ChangeTime) {
            this.article = input.article;

            const applicationUrl = ClientStorageService.getApplicationUrl();
            this.state.url = `${applicationUrl}/views/tickets/${this.article?.TicketID}/articles/${this.article?.ArticleID}`;
        }
    }

    public viewLoaded(event: any): void {
        const frameDocument = event.target.contentWindow.document;

        const frame = document.getElementById(this.state.frameId);
        const frameHeight = frameDocument.documentElement.scrollHeight;
        frame.style.height = frameHeight + 'px';
    }
}

module.exports = Component;
