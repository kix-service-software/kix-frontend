/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutocompleteOption } from '../../../../../../model/AutocompleteOption';
import { FormContext } from '../../../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectProperty } from '../../../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { AdditionalContextInformation } from '../../../../../base-components/webapp/core/AdditionalContextInformation';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { DynamicFieldObjectFormValue } from '../../../../../object-forms/model/FormValues/DynamicFieldObjectFormValue';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { RichTextFormValue } from '../../../../../object-forms/model/FormValues/RichTextFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { Article } from '../../../../model/Article';
import { ArticleLoadingOptions } from '../../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { Channel } from '../../../../model/Channel';
import { ArticleAttachmentFormValue } from './ArticleAttachmentFormValue';
import { CustomerVisibleFormValue } from './CustomerVisibleFormValue';
import { EncryptIfPossibleFormValue } from './EncryptIfPossibleFormValue';
import { IncomingTimeFormValue } from './IncomingTimeFormValue';
import { RecipientFormValue } from './RecipientFormValue';

export class ChannelFormValue extends SelectObjectFormValue<number> {

    public noChannelSelectable: boolean = false;

    public constructor(
        property: string,
        article: Article,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, article, objectValueMapper, parent);

        this.objectType = KIXObjectType.CHANNEL;
        this.structureOption = false;
        this.inputComponentId = 'channel-form-input';

        this.createArticleFormValues(article);
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();

        if (!this.value) {
            const article = await this.getReferencedArticle();
            this.value = article?.ChannelID;
        }

        if (this.value) {
            await this.setChannelFields(this.value);
        } else {
            for (const fv of this.formValues) {
                if (fv.property === KIXObjectProperty.DYNAMIC_FIELDS) {
                    fv.formValues?.forEach((dfv) => dfv.enabled = false);
                } else {
                    fv.enabled = false;
                }
            }
        }

        this.object?.addBinding(ArticleProperty.CHANNEL_ID, async (value: number) => {
            if (this.visible) {
                await this.setChannelFields(value);
            }
        });
    }

    private async getReferencedArticle(): Promise<Article> {
        const context = ContextService.getInstance().getActiveContext();
        let article = context.getAdditionalInformation('REFERENCED_ARTICLE');

        const refArticleId = context?.getAdditionalInformation(ArticleProperty.REFERENCED_ARTICLE_ID);
        if (!article && refArticleId) {
            const refTicketId = context?.getObjectId();
            article = await this.loadReferencedArticle(Number(refTicketId), refArticleId);
        }

        return article;
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);

        const noChannelOption = field.options.find((o) => o.option === 'NO_CHANNEL');
        if (noChannelOption) {
            this.noChannelSelectable = noChannelOption?.value;
        } else {
            this.noChannelSelectable =
                this.objectValueMapper.formContext === FormContext.EDIT
                && !this.required
                && !this.readonly;
        }
    }

    protected createArticleFormValues(article: Article): void {
        for (const property in article) {
            if (!Object.prototype.hasOwnProperty.call(article, property)) {
                continue;
            }

            this.createArticleFormValue(property, article);
        }

        const index = this.formValues.findIndex((fv) => fv.property === KIXObjectProperty.DYNAMIC_FIELDS);
        if (index !== -1) {
            const dfFormValue = this.formValues.splice(index, 1);
            dfFormValue[0].isSortable = false;
            dfFormValue[0].disable();
            this.formValues.push(dfFormValue[0]);
        }

        // property only needed for article create
        if (!ContextService.getInstance().getActiveContext()?.getAdditionalInformation('ARTICLE_UPDATE_ID')) {
            const encyptFormValue = new EncryptIfPossibleFormValue(
                ArticleProperty.ENCRYPT_IF_POSSIBLE, article, this.objectValueMapper, this
            );
            encyptFormValue.visible = true;
            encyptFormValue.isSortable = false;
            // add it after recipents
            const bccIndex = this.formValues.findIndex((fv) => fv.property === ArticleProperty.BCC);
            this.formValues.splice(bccIndex + 1, 0, encyptFormValue);
        }
    }

    protected createArticleFormValue(property: string, article: Article): void {
        let formValue: ObjectFormValue;
        switch (property) {
            case ArticleProperty.TO:
            case ArticleProperty.CC:
            case ArticleProperty.BCC:
                formValue = new RecipientFormValue(property, article, this.objectValueMapper, this);
                break;
            case ArticleProperty.CUSTOMER_VISIBLE:
                formValue = new CustomerVisibleFormValue(property, article, this.objectValueMapper, this);
                break;
            case ArticleProperty.SUBJECT:
                formValue = new ObjectFormValue(property, article, this.objectValueMapper, this);
                formValue.required = true;
                break;
            case ArticleProperty.BODY:
                formValue = new RichTextFormValue(
                    property, article, this.objectValueMapper, this,
                    [new AutocompleteOption(KIXObjectType.TEXT_MODULE, '::')]
                );
                formValue.required = true;
                break;
            case ArticleProperty.ATTACHMENTS:
                formValue = new ArticleAttachmentFormValue(property, article, this.objectValueMapper, this);
                break;
            case ArticleProperty.INCOMING_TIME:
                formValue = new IncomingTimeFormValue(property, article, this.objectValueMapper, this);
                break;
            case KIXObjectProperty.DYNAMIC_FIELDS:
                formValue = new DynamicFieldObjectFormValue(
                    KIXObjectProperty.DYNAMIC_FIELDS, article, this.objectValueMapper, this
                );
                break;
            default:
        }

        if (formValue) {
            formValue.visible = true;
            formValue.isSortable = false;

            // subject and body are always required (if enabled)
            if (formValue.property === ArticleProperty.SUBJECT || formValue.property === ArticleProperty.BODY) {
                formValue.required = true;
            }

            // initial not visible (formActions should show them)
            if (formValue.property === ArticleProperty.CC || formValue.property === ArticleProperty.BCC) {
                formValue.visible = false;
            }
            this.formValues.push(formValue);
        }

    }

    protected async setChannelFields(channelId: number): Promise<void> {
        const allFields = [
            ArticleProperty.CUSTOMER_VISIBLE,
            ArticleProperty.TO, ArticleProperty.CC, ArticleProperty.BCC,
            ArticleProperty.SUBJECT, ArticleProperty.BODY, ArticleProperty.ATTACHMENTS,
            ArticleProperty.ENCRYPT_IF_POSSIBLE
        ];

        const dfFormValue = this.formValues.find((fv) => fv.property === KIXObjectProperty.DYNAMIC_FIELDS);

        if (channelId) {
            const channels = await KIXObjectService.loadObjects<Channel>(KIXObjectType.CHANNEL, [channelId])
                .catch((): Channel[] => []);
            const channel = Array.isArray(channels) && channels.length ? channels[0] : null;

            const context = ContextService.getInstance().getActiveContext();
            const articleUpdateID = context?.getAdditionalInformation('ARTICLE_UPDATE_ID');

            const noteFields = [
                ArticleProperty.CUSTOMER_VISIBLE, ArticleProperty.SUBJECT,
                ArticleProperty.BODY, ArticleProperty.ATTACHMENTS
            ];

            const mailFields = [
                ArticleProperty.CUSTOMER_VISIBLE,
                ArticleProperty.TO, ArticleProperty.CC, ArticleProperty.BCC,
                ArticleProperty.SUBJECT, ArticleProperty.BODY, ArticleProperty.ATTACHMENTS
            ];

            if (articleUpdateID) {
                noteFields.push(ArticleProperty.INCOMING_TIME);
                mailFields.push(ArticleProperty.INCOMING_TIME);
            } else {
                // add encrypt field for new article, not on article update
                mailFields.push(ArticleProperty.ENCRYPT_IF_POSSIBLE);
            }

            let submitPattern = 'Translatable#Save';
            if (channel?.Name === 'note') {
                await this.disableChannelFormValues(allFields.filter((p) => !noteFields.includes(p)));
                await this.enableChannelFormValues(channel.Name, noteFields);
            } else if (channel?.Name === 'email') {
                await this.disableChannelFormValues(allFields.filter((p) => !mailFields.includes(p)));
                await this.enableChannelFormValues(channel.Name, mailFields);
                submitPattern = 'Translatable#Send';
            }

            context.setAdditionalInformation(AdditionalContextInformation.DIALOG_SUBMIT_BUTTON_TEXT, submitPattern);

            for (const fv of dfFormValue?.formValues) {
                await fv.enable();
                fv.isSortable = false;
            }
        } else {
            this.disableChannelFormValues(allFields);
            for (const fv of dfFormValue?.formValues) {
                await fv.disable();
            }
        }
    }

    protected async enableChannelFormValues(channelName: string, properties: ArticleProperty[]): Promise<void> {
        for (const property of properties) {
            const formValue = this.formValues.find((fv) => fv.property === property);

            const isEdit = this.objectValueMapper.formContext === FormContext.EDIT;

            if (formValue) {
                if (property === ArticleProperty.CC) {
                    const toValue = this.formValues.find((fv) => fv.property === ArticleProperty.TO);
                    const canShow = (!toValue?.enabled && !isEdit) || (toValue?.enabled && formValue?.value && isEdit);
                    formValue.visible = canShow;
                }
                if (property === ArticleProperty.BCC) {
                    const toValue = this.formValues.find((fv) => fv.property === ArticleProperty.TO);
                    const canShow = toValue?.enabled && formValue?.value && isEdit;
                    formValue.visible = canShow;
                }

                // TO is enabled for edit or if set by template (initFormValueByField in RecipientFormValue)
                if (formValue.property !== ArticleProperty.TO || isEdit) {
                    await formValue.enable();
                }

                // make sure relevant properties are always required
                if (formValue.property === ArticleProperty.TO) {
                    formValue.required = channelName === 'email' && this.visible;
                }

                if (formValue.property === ArticleProperty.SUBJECT || formValue.property === ArticleProperty.BODY) {
                    formValue.required = true;
                }

                // use default if given
                if (!formValue.value && formValue.defaultValue) {
                    formValue.value = formValue.defaultValue;
                }
            }
        }
    }

    protected async disableChannelFormValues(properties: ArticleProperty[]): Promise<void> {
        for (const property of properties) {
            const formValue = this.formValues.find((fv) => fv.property === property);

            if (formValue) {
                await formValue.disable();
            }
        }
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

    public async reset(
        ignoreProperties?: string[], ignoreFormValueProperties?: string[], ignoreFormValueReset?: string[]
    ): Promise<void> {
        return;
    }

}
