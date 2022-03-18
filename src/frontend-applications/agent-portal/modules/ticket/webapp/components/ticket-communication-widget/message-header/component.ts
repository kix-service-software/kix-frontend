/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../model/Context';
import { KIXObjectProperty } from '../../../../../../model/kix/KIXObjectProperty';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { TicketService } from '../../../core';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.article = input.article;
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();

        if (this.state.article) {
            const attachments = this.state.article.Attachments || [];
            this.state.attachmentCount = attachments.filter((a) => !a.Filename.match(/^file-(1|2)$/)).length;

            this.state.channelTooltip = await LabelService.getInstance().getDisplayText(
                this.state.article, ArticleProperty.CHANNEL_ID
            );
            if (this.state.article.isUnsent()) {
                this.state.channelTooltip += ` (${this.state.article.getUnsentError()})`;
            }

            const icons = await LabelService.getInstance().getIcons(this.state.article, ArticleProperty.CHANNEL_ID);
            if (icons?.length) {
                this.state.channelIcon = icons[0];
            }

            this.state.createTimeString = await LabelService.getInstance().getDisplayText(
                this.state.article, KIXObjectProperty.CREATE_TIME
            );

            // TODO: TimeUnit(s) is a article property in KIXPro (extension?)
            if (this.state.article && this.state.article['TimeUnit']) {
                this.state.timeUnits = await LabelService.getInstance().getDisplayText(
                    this.state.article, 'TimeUnits'
                );
            }
        }

        this.state.translations = await TranslationService.createTranslationObject(
            [
                'Translatable#Visible in customer portal', 'Translatable#Download all attachments',
                'Translatable#Created at', 'Translatable#From'
            ]
        );
    }

    public async attachmentsClicked(event?: any): Promise<void> {
        if (this.state.article) {
            const attachment = await TicketService.getInstance().loadArticleZipAttachment(
                this.state.article.TicketID, this.state.article.ArticleID
            );
            BrowserUtil.startBrowserDownload(attachment.Filename, attachment.Content, attachment.ContentType);
        }
    }
}

module.exports = Component;