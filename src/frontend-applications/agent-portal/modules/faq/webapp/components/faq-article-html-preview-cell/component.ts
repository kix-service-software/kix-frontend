/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ComponentContent } from '../../../../base-components/webapp/core/ComponentContent';
import { OverlayService } from '../../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../base-components/webapp/core/OverlayType';
import { Cell } from '../../../../table/model/Cell';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { FAQArticle } from '../../../model/FAQArticle';
import { FAQArticleHandler } from '../../core/FAQArticleHandler';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private faqArticle: FAQArticle;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const cell: Cell = input.cell;
        if (cell) {
            this.faqArticle = cell.getRow().getRowObject().getObject();
        }
    }

    public async onMount(): Promise<void> {
        this.state.title = await TranslationService.translate('Translatable#Preview');
    }

    public async showPreview(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        const faqArticleHTML = await FAQArticleHandler.prepareFAQArticleHTML(this.faqArticle.ID);
        const attachmentSummary = await FAQArticleHandler.getAttachmentSummaryHTML(this.faqArticle.ID);
        const content = new ComponentContent(
            'editor', {
            value: attachmentSummary + faqArticleHTML,
            readOnly: true,
            useReadonlyStyle: true
        }
        );
        OverlayService.getInstance().openOverlay(
            OverlayType.INFO, null, content, this.faqArticle.Title, 'kix-icon-faq', false, null, null, true
        );
    }

}

module.exports = Component;
