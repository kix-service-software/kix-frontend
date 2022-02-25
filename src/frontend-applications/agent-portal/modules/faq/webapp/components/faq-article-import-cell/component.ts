/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
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
        this.state.title = await TranslationService.translate('Translatable#Insert into article');
    }

    public async importClicked(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        FAQArticleHandler.publishFAQArticleAsHTMLWithAttachments(this.faqArticle.ID);
    }

}

module.exports = Component;
