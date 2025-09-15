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
import { ClientStorageService } from '../../../../base-components/webapp/core/ClientStorageService';
import { IdService } from '../../../../../model/IdService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    private article: Article = null;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.state.frameId = IdService.generateDateBasedId('article-view-');
    }

    public onInput(input: any): void {
        if (this.article?.ChangeTime !== input.article?.ChangeTime) {
            this.article = input.article;

            const applicationUrl = ClientStorageService.getApplicationUrl();
            this.state.url = `${applicationUrl}/views/tickets/${this.article?.TicketID}/articles/${this.article?.ArticleID}?prepareInline=true`;
        }
    }

    public viewLoaded(event: any): void {
        const frame = document.getElementById(this.state.frameId) as HTMLIFrameElement;

        frame.addEventListener('load', () => {
            let frameDocument: Document;

            try {
                frameDocument = frame.contentWindow.document;
            } catch (e) {
                console.warn('iframe content not accessible due to cross-origin policy:', e);
                return;
            }

            const frameHeight = frameDocument?.documentElement?.scrollHeight || 0;
            frame.style.height = frameHeight + 10 + 'px';

            const links = frameDocument.querySelectorAll('a[href]');
            links.forEach((link: HTMLAnchorElement) => {
                const href = link.href;
                const isInternal = href?.startsWith(window.location.origin);

                if (isInternal) {
                    link.addEventListener('click', (event): void => {
                        event.preventDefault();
                        BrowserUtil.handleLinkClicked(event);
                    });
                } else {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                    link.addEventListener('click', (event): void => {
                        event.preventDefault();
                        window.open(href, '_blank', 'noopener,noreferrer');
                    });
                }
            });
        });
    }
}

module.exports = Component;