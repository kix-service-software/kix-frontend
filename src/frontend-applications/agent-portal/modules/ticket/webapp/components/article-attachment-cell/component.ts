/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { Article } from '../../../model/Article';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { Cell } from '../../../../table/model/Cell';

class Component extends AbstractMarkoComponent<ComponentState> {

    private article: Article;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const cell: Cell = input.cell;
        if (cell) {
            this.article = cell.getRow().getRowObject().getObject();
            if (this.article && this.article.Attachments) {
                const attachments = this.article.Attachments.filter((a) => a.Disposition !== 'inline' || a.ContentID.length === 0 && !a.Filename.match(/^file-(1|2)$/));
                this.state.show = attachments.length > 0;
                this.state.count = attachments.length;
            }
        }
    }

    public async onMount(): Promise<void> {
        return;
    }

    public attachmentClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        if (this.article) {
            const data = { article: this.article };

            OverlayService.getInstance().openOverlay(
                OverlayType.INFO,
                'article-attachment-widget',
                new ComponentContent('ticket-article-attachment-list', data, this.article),
                'Anlagen',
                null,
                false,
                [
                    event.target.getBoundingClientRect().left,
                    event.target.getBoundingClientRect().top
                ]
            );
        }

    }

}

module.exports = Component;
