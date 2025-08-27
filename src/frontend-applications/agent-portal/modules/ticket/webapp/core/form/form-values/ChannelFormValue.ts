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
import { DynamicFormFieldOption } from '../../../../../dynamic-fields/webapp/core';
import { FormValueProperty } from '../../../../../object-forms/model/FormValueProperty';
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

    private fieldOrder: any = {};

    public constructor(
        property: string,
        private article: Article,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, article, objectValueMapper, parent);

        this.objectType = KIXObjectType.CHANNEL;
        this.structureOption = false;
        this.inputComponentId = 'channel-form-input';

        this.fieldOrder[ArticleProperty.CUSTOMER_VISIBLE] = 0;
        this.fieldOrder[ArticleProperty.TO] = 1;
        this.fieldOrder[ArticleProperty.CC] = 2;
        this.fieldOrder[ArticleProperty.BCC] = 3;
        this.fieldOrder[ArticleProperty.ENCRYPT_IF_POSSIBLE] = 4;
        this.fieldOrder[ArticleProperty.SUBJECT] = 5;
        this.fieldOrder[ArticleProperty.BODY] = 6;
        this.fieldOrder[ArticleProperty.ATTACHMENTS] = 7;

        this.createArticleFormValues(article);
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();

        if (!this.value) {
            const article = await this.getReferencedArticle();
            this.value = article?.ChannelID;
        }

        if (this.value) {
            await this.setChannelFields(this.value, true);
        } else {
            for (const fv of this.formValues) {
                if (fv.property === KIXObjectProperty.DYNAMIC_FIELDS) {
                    fv.formValues?.forEach((dfv) => {
                        dfv.enabled = false;
                        fv.isConfigurable = false;
                    });
                } else {
                    fv.enabled = false;
                    fv.isConfigurable = false;
                }
            }
        }

        this.object?.addBinding(ArticleProperty.CHANNEL_ID, async (value: number) => {
            await this.setChannelFields(value);
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

        if (!this.value && this.defaultValue) {
            this.value = this.defaultValue;
        }

        // do not show in article edit forms
        if (this.shouldSetInvisible()) {
            this.visible = false;
            this.readonly = true;
        } else {
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

        this.sortArticleDFs(field);
    }

    private shouldSetInvisible(): boolean {
        const context = ContextService.getInstance().getActiveContext();
        return (this.object as Article).ArticleID && context.getAdditionalInformation('ARTICLE_FORWARD');
    }

    protected async setDefaultValue(field: FormFieldConfiguration): Promise<void> {
        const defaultValue = field.defaultValue?.value;
        let hasDefaultValue = (typeof defaultValue !== 'undefined' && defaultValue !== null && defaultValue !== '');
        if (Array.isArray(defaultValue)) {
            hasDefaultValue = defaultValue.length > 0;
        }

        if (field.empty) {
            this.defaultValue = null;
            this.empty = true;
        } else if (hasDefaultValue) {
            const value = await this.handlePlaceholders(field.defaultValue?.value);
            this.defaultValue = value;
        }
    }

    protected sortArticleDFs(field: FormFieldConfiguration): void {
        const channelGroup = this.objectValueMapper.objectFormHandler.getGroupForField(field?.id);
        const dfValue = this.findFormValue(KIXObjectProperty.DYNAMIC_FIELDS);
        if (channelGroup && channelGroup.formFields?.length && dfValue?.formValues?.length) {
            // get all ArticleDFs from Group
            let newFormValues = [];
            const dfFields = channelGroup.formFields?.filter((f) => f.property === KIXObjectProperty.DYNAMIC_FIELDS);
            for (const field of dfFields) {
                const option = field.options?.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
                const index = dfValue?.formValues.findIndex((fv) => fv['dfName'] === option?.value);
                if (index !== -1) {
                    newFormValues.push(...dfValue.formValues.splice(index, 1));
                }
            }

            dfValue.formValues = [...newFormValues, ...dfValue.formValues];
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
            dfFormValue[0].disable();
            this.formValues.push(dfFormValue[0]);
        }

        // property only needed for article create
        if (
            !ContextService.getInstance().getActiveContext()?.getAdditionalInformation('ARTICLE_UPDATE_ID') &&
            // FIXME: hide it in form designer for now (implement it as "real" property which can be configured)
            !this.objectValueMapper?.objectFormHandler?.configurationMode
        ) {
            const encyptFormValue = new EncryptIfPossibleFormValue(
                ArticleProperty.ENCRYPT_IF_POSSIBLE, article, this.objectValueMapper, this
            );
            encyptFormValue.visible = true;
            encyptFormValue.isControlledByParent = true;
            this.formValues.push(encyptFormValue);
        }

        this.formValues.sort((a, b) => {
            const aFieldOrder = this.fieldOrder[a.property];
            const bFieldOrder = this.fieldOrder[b.property];

            if (aFieldOrder !== undefined && bFieldOrder !== undefined) {
                return aFieldOrder - bFieldOrder;
            } else if (aFieldOrder !== undefined && bFieldOrder === undefined) {
                return -1;
            } else {
                return 1;
            }
        });
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
            formValue.isControlledByParent = true;

            // subject and body are always required (if enabled)
            if (formValue.property === ArticleProperty.SUBJECT || formValue.property === ArticleProperty.BODY) {
                formValue.required = true;
            }

            // initial not visible (formActions should show them)
            if (
                !this.objectValueMapper?.objectFormHandler?.configurationMode &&
                (
                    formValue.property === ArticleProperty.CC ||
                    formValue.property === ArticleProperty.BCC ||
                    formValue.property === ArticleProperty.TO
                )
            ) {
                formValue.visible = false;
            }
            this.formValues.push(formValue);
        }

    }

    protected async setChannelFields(channelId: number, byInit?: boolean): Promise<void> {
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
                await this.enableChannelFormValues(channel.Name, mailFields, byInit);
                submitPattern = 'Translatable#Send';
            }

            context.setAdditionalInformation(AdditionalContextInformation.DIALOG_SUBMIT_BUTTON_TEXT, submitPattern);

            // handle enable only on channel switch
            if (dfFormValue?.formValues && !byInit) {
                for (const fv of dfFormValue.formValues.filter((fv) => fv.fieldId)) {
                    if (fv['COUNT_CONTAINER']) {
                        fv.isConfigurable = fv.formValues?.length > 0;
                    } else {
                        fv.isConfigurable = true;
                    }
                    await fv.enable();
                }
            }
        } else {
            this.disableChannelFormValues(allFields);
            if (dfFormValue?.formValues) {
                for (const fv of dfFormValue.formValues) {
                    await fv.disable();
                    fv.isConfigurable = false;
                }
            }
        }
    }

    // TODO: new ChannelFormValue for configuration => competitive requirements for dialog use and designer
    protected async enableChannelFormValues(
        channelName: string, properties: ArticleProperty[], byInit?: boolean
    ): Promise<void> {
        for (const property of properties) {
            const formValue = this.formValues.find((fv) => fv.property === property);

            const isEdit = this.objectValueMapper.formContext === FormContext.EDIT;

            if (formValue) {

                // use default if given
                if (!formValue.value && formValue.defaultValue) {
                    await formValue.setFormValue(formValue.defaultValue);
                }

                if (property === ArticleProperty.TO && isEdit) {
                    formValue.visible = true;
                    formValue.setNewInitialState(FormValueProperty.VISIBLE, true);
                    formValue.setNewInitialState(FormValueProperty.ENABLED, true);
                }

                if (property === ArticleProperty.CC) {
                    const toValue = this.formValues.find((fv) => fv.property === ArticleProperty.TO);
                    const canShow = ((!toValue?.enabled || !toValue.visible) && !isEdit) ||
                        formValue?.value ||
                        this.objectValueMapper?.objectFormHandler?.configurationMode ||
                        (byInit && formValue.visible);
                    formValue.visible = canShow;
                }

                if (property === ArticleProperty.BCC) {
                    const toValue = this.formValues.find((fv) => fv.property === ArticleProperty.TO);
                    const canShow = formValue?.value ||
                        this.objectValueMapper?.objectFormHandler?.configurationMode ||
                        (byInit && formValue.visible);
                    formValue.visible = canShow;
                }

                await formValue.enable();

                // make sure relevant properties are always required
                if (!this.objectValueMapper?.objectFormHandler?.configurationMode) {
                    if (formValue.property === ArticleProperty.TO && isEdit && !formValue.required) {
                        formValue.required = channelName === 'email' && this.visible;
                    }

                    if (formValue.property === ArticleProperty.SUBJECT || formValue.property === ArticleProperty.BODY) {
                        formValue.required = true;
                    }
                }

                if (formValue.fieldId) {
                    formValue.isConfigurable = true;
                }
            }
        }
    }

    protected async disableChannelFormValues(properties: ArticleProperty[]): Promise<void> {
        for (const property of properties) {
            const formValue = this.formValues.find((fv) => fv.property === property);

            if (formValue) {
                await formValue.disable();
                formValue.setNewInitialState(FormValueProperty.VISIBLE, false);
                formValue.setNewInitialState(FormValueProperty.ENABLED, false);
                formValue.isConfigurable = false;
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
