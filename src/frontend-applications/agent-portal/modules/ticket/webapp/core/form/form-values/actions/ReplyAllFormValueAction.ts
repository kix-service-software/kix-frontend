/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../../base-components/webapp/core/KIXObjectService';
import { FormValueAction } from '../../../../../../object-forms/model/FormValues/FormValueAction';
import { SystemAddress } from '../../../../../../system-address/model/SystemAddress';
import { Article } from '../../../../../model/Article';
import { ArticleLoadingOptions } from '../../../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../../../model/ArticleProperty';
import { ArticleReceiver } from '../../../../../model/ArticleReceiver';
import { Ticket } from '../../../../../model/Ticket';


export class ReplyAllFormValueAction extends FormValueAction {

    private referencedArticleId: number;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Reply All';
        this.icon = 'kix-icon-mail-answerall-outline';
        const context = ContextService.getInstance().getActiveContext();
        this.referencedArticleId = context?.getAdditionalInformation(ArticleProperty.REFERENCED_ARTICLE_ID);
    }

    public async canShow(): Promise<boolean> {
        return this.formValue.enabled && Boolean(this.referencedArticleId);
    }

    public canRun(): boolean {
        return this.formValue.enabled && Boolean(this.referencedArticleId);
    }

    public async run(event: any): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const refTicketId = await context?.getObjectId();
        const formTicket: Ticket = await context?.getObject(KIXObjectType.TICKET);

        const replyArticle = refTicketId ? await this.getReplyArticle(Number(refTicketId)) : null;
        if (replyArticle) {
            if (Array.isArray(formTicket?.Articles) && formTicket.Articles[0]) {
                const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
                    KIXObjectType.SYSTEM_ADDRESS
                );
                const filterList: string[] = systemAddresses.map((sa) => sa.Name);

                this.setNewObjectValue(
                    replyArticle.toList, filterList,
                    formTicket.Articles[0], ArticleProperty.TO
                );
                this.setNewObjectValue(
                    replyArticle.ccList, filterList,
                    formTicket.Articles[0], ArticleProperty.CC
                );
            }
        }
    }

    private async getReplyArticle(ticketId: number): Promise<Article> {
        let replyArticle: Article;
        if (this.referencedArticleId && ticketId) {
            const articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, [this.referencedArticleId], null,
                new ArticleLoadingOptions(ticketId), true
            ).catch(() => [] as Article[]);
            replyArticle = articles.find((a) => a.ArticleID === this.referencedArticleId);
        }
        return replyArticle;
    }

    private setNewObjectValue(
        referenceList: ArticleReceiver[], filterList: string[] = [], article: Article, property: ArticleProperty
    ): void {
        if (Array.isArray(referenceList)) {
            const currentRecipients: ArticleReceiver[] = [];
            article.prepareRecieverList(currentRecipients, article[property]);

            const newAddresses: string[] = [];
            referenceList.forEach((r) => {
                if (!currentRecipients.some((cr) => cr.email === r.email) && !filterList.includes(r.email)) {
                    if (r.realName) {
                        newAddresses.push(`"${r.realName}" <${r.email}>`);
                    } else {
                        newAddresses.push(r.email);
                    }

                    // extend filter
                    filterList.push(r.email);
                }
            });

            if (newAddresses.length) {
                const formValue = this.objectValueMapper.findFormValue(property);
                if (formValue?.enabled) {
                    formValue.setFormValue([
                        ...(Array.isArray(formValue.value) ? formValue.value : []),
                        ...newAddresses
                    ]);

                    formValue.visible = true;
                    formValue.setNewInitialState('visible', true);
                }
            }
        }
    }
}