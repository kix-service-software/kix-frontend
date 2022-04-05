/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ArticleLabelProvider } from '../../core';
import { ArticleReceiver } from '../../../model/ArticleReceiver';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';

class TicketArticleMetadataComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.labelProvider = new ArticleLabelProvider();
    }

    public onInput(input: any): void {
        this.state.article = input.article;
        if (this.state.article.toList.length) {
            this.state.showTo = true;
            this.state.receiverToString = this.getReceiverString(this.state.article.toList[0]);
        }

        if (this.state.article.ccList.length) {
            this.state.showCc = true;
            this.state.receiverCcString = this.getReceiverString(this.state.article.ccList[0]);
        }

        if (this.state.article.bccList.length) {
            this.state.showBcc = true;
            this.state.receiverBccString = this.getReceiverString(this.state.article.bccList[0]);
        }
    }

    private getReceiverString(receiver: ArticleReceiver): string {
        return receiver.email;
    }

    public showOverlay(property: string, event: any): void {
        let list = this.state.article.toList;
        let instanceId = 'to-receiver-overlay';
        if (property === ArticleProperty.CC) {
            list = this.state.article.ccList;
            instanceId = 'cc-receiver-overlay';
        } else if (property === ArticleProperty.BCC) {
            list = this.state.article.bccList;
            instanceId = 'bcc-receiver-overlay';
        }

        OverlayService.getInstance().openOverlay(
            OverlayType.INFO, instanceId,
            new ComponentContent('article-receiver-list', { receiver: list }),
            null, null, false,
            [
                event.target.getBoundingClientRect().left + BrowserUtil.getBrowserFontsize(),
                event.target.getBoundingClientRect().top
            ],
            'article-metadata', true
        );
    }

}

module.exports = TicketArticleMetadataComponent;
