/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { BooleanFormValue } from '../../../../../object-forms/model/FormValues/BooleanFormValue';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { Article } from '../../../../model/Article';
import { ArticleLoadingOptions } from '../../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import addrparser from 'address-rfc2822';
import { TicketProperty } from '../../../../model/TicketProperty';
import { FormContext } from '../../../../../../model/configuration/FormContext';

export class EncryptIfPossibleFormValue extends BooleanFormValue {

    private relevantArticleEmailProperties: string[] = [
        ArticleProperty.TO,
        ArticleProperty.CC,
        ArticleProperty.BCC
    ];

    public constructor(
        property: string,
        article: Article,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, article, objectValueMapper, parent);

        this.relevantArticleEmailProperties.forEach((p) =>
            this.object?.addBinding(p, async (value: any) => {
                await this.handleEnable();
            })
        );
        this.object?.addBinding(ArticleProperty.CHANNEL_ID, async (value: any) => {
            await this.handleEnable();
        });
        if (this.objectValueMapper.formContext === FormContext.NEW) {
            this.object?.ticket?.addBinding(TicketProperty.CONTACT_ID, async (value: any) => {
                await this.handleEnable();
            });
        };
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();

        if (!this.hint) {
            this.hint = await TranslationService.translate('Translatable#Helptext_Tickets_TicketCreate_EncryptIfPossible');
        }

        // TODO: needed?
        const article = await this.getReferencedArticle();
        if (article) {
            this.value = Boolean(article?.SMIMEEncrypted);
        }

        // check requirements (pevent positive value if set by template)
        this.handleEnable();
    }

    private async getReferencedArticle(): Promise<Article> {
        const context = ContextService.getInstance().getActiveContext();
        let article: Article = context?.getAdditionalInformation('REFERENCED_ARTICLE');

        const refArticleId = context?.getAdditionalInformation(ArticleProperty.REFERENCED_ARTICLE_ID);
        if (!article && refArticleId) {
            const refTicketId = context?.getObjectId();
            article = await this.loadReferencedArticle(Number(refTicketId), refArticleId);
        }

        return article;
    }

    private async loadReferencedArticle(refTicketId: number, refArticleId: number): Promise<Article> {
        let article: Article;
        if (refArticleId && refTicketId) {
            const articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, [refArticleId], null,
                new ArticleLoadingOptions(refTicketId), true
            ).catch(() => [] as Article[]);
            article = articles.find((a) => a.ArticleID === refArticleId);
        }
        return article;
    }

    public async enable(): Promise<void> {
        this.handleEnable();
    }

    // enable if only just one recipient is set
    public handleEnable(): void {
        let recipientCount = 0;

        if (this.object.ChannelID === 2) {
            if (this.object) {
                this.relevantArticleEmailProperties.forEach((rp) => {
                    if (this.object[rp]) {
                        const recipients = this.parseAddresses(this.object[rp]);
                        recipientCount += recipients.length;
                    }
                });
            }

            // in new context, check contact (used as To)
            if (
                this.objectValueMapper.formContext === FormContext.NEW && this.object?.ticket?.ContactID
            ) {
                recipientCount++;
            }
        }

        if (recipientCount === 1) {
            if (!this.enabled) {
                super.enable();
                this.value = this.defaultValue;
            }
        } else {
            this.disable();
        }
    }

    private parseAddresses(value: string): string[] {
        let emailAddresses = [];
        try {
            emailAddresses = addrparser.parse(value);
        } catch (error) {
            // do nothing
        }
        return emailAddresses;
    }

}