/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../model/Context';
import { KIXObjectProperty } from '../../../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { User } from '../../../../../user/model/User';
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

        if (this.state.article?.ChangeTime !== input.article?.ChangeTime) {
            this.updateArticleData();
        }

        const attachments = this.state.article?.Attachments || [];
        this.state.attachmentCount = attachments.filter((a) => !a.Filename.match(/^file-(1|2)$/)).length;
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();

        if (this.state.article) {
            this.updateArticleData();
        }

        this.state.translations = await TranslationService.createTranslationObject(
            [
                'Translatable#Visible in customer portal', 'Translatable#Download all attachments',
                'Translatable#Created at', 'Translatable#From', 'Translatable#edited',
                'Translatable#Created by'
            ]
        );
    }

    private async updateArticleData(): Promise<void> {
        this.state.channelTooltip = await LabelService.getInstance().getDisplayText(
            this.state.article, ArticleProperty.CHANNEL_ID
        );
        let channelIcons = await LabelService.getInstance().getIcons(this.state.article, ArticleProperty.CHANNEL_ID);

        if (this.state.article.isUnsent()) {
            this.state.channelTooltip += ` (${this.state.article.getUnsentError()})`;
            // get unsent channel icon (unsent is not considered by ChannelID)
            const articleLabelProvider = LabelService.getInstance().getLabelProvider(this.state.article);
            channelIcons = await LabelService.getInstance().getIcons(this.state.article, 'Unsent');
        }

        this.state.channelIcon = channelIcons?.length ? channelIcons[0] : null;

        this.state.createTimeString = await LabelService.getInstance().getDisplayText(
            this.state.article, ArticleProperty.INCOMING_TIME
        );

        this.prepareSMIMEIcons();

        if (this.state.article.ChangeTime !== this.state.article.CreateTime) {
            const users = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, [this.state.article.ChangedBy]
            ).catch(() => [] as User[]);

            const userLoging = users?.length ? users[0].UserLogin : '';

            this.state.changeTitle = await LabelService.getInstance().getDisplayText(
                this.state.article, KIXObjectProperty.CHANGE_TIME
            );
            this.state.changeTitle = await TranslationService.translate('Translatable#edited at {0} by {1}', [this.state.changeTitle, userLoging]);
        }

        // TODO: TimeUnit(s) is a article property in KIXPro (extension?)
        if (this.state.article && this.state.article['TimeUnit']) {
            this.state.timeUnits = await LabelService.getInstance().getDisplayText(
                this.state.article, 'TimeUnits'
            );
        }
    }

    private async prepareSMIMEIcons(): Promise<void> {
        if (this.state.article.SMIMEEncrypted) {
            const property = this.state.article.SenderType === 'external' ?
                ArticleProperty.SMIME_DECRYPTED : ArticleProperty.SMIME_ENCRYPTED;
            this.state.smimeEncryptedTooltip = await LabelService.getInstance().getDisplayText(
                this.state.article, property
            );
            if (!this.state.article[property]) {
                this.state.smimeEncryptedTooltip += ` (${this.state.article.SMIMEEncryptedError})`;
            }
            const icons = await LabelService.getInstance().getIcons(
                this.state.article, property
            ) || [];
            this.state.smimeEncryptedIcon = icons?.length ? icons[0] : null;
            this.state.smimeDecrypted = this.state.article[property];
        }
    }

    public async attachmentsClicked(event?: any): Promise<void> {
        if (event) {
            event.stopPropagation();
        }
        if (this.state.article) {
            const attachment = await TicketService.getInstance().loadArticleZipAttachment(
                this.state.article.TicketID, this.state.article.ArticleID
            );
            BrowserUtil.startFileDownload(attachment);
        }
    }
}

module.exports = Component;
