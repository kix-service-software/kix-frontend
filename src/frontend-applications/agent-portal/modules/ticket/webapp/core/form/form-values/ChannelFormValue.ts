/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutocompleteOption } from '../../../../../../model/AutocompleteOption';
import { FormContext } from '../../../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { AdditionalContextInformation } from '../../../../../base-components/webapp/core/AdditionalContextInformation';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { RichTextFormValue } from '../../../../../object-forms/model/FormValues/RichTextFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { Article } from '../../../../model/Article';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { Channel } from '../../../../model/Channel';
import { ArticleAttachmentFormValue } from './ArticleAttachmentFormValue';
import { CustomerVisibleFormValue } from './CustomerVisibleFormValue';
import { FromObjectFormValue } from './FromObjectFormValue';
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

        article?.addBinding(ArticleProperty.CHANNEL_ID, async (value: number) => {
            if (this.visible) {
                await this.setChannelFields(value);
            }
        });
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();

        if (!this.value) {
            const selectedNodes = this.getSelectableTreeNodeValues();
            const selection = selectedNodes?.length ? [selectedNodes[0]] : [];
            this.treeHandler.setSelection(selection);
        }

        await this.setChannelFields(this.value);
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

    private createArticleFormValues(article: Article): void {
        for (const property in article) {
            if (!Object.prototype.hasOwnProperty.call(article, property)) {
                continue;
            }

            let formValue;
            switch (property) {
                case ArticleProperty.TO:
                case ArticleProperty.CC:
                case ArticleProperty.BCC:
                    formValue = new RecipientFormValue(property, article, this.objectValueMapper, this);
                    break;
                case ArticleProperty.FROM:
                    formValue = new FromObjectFormValue(property, article, this.objectValueMapper, this);
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
    }

    private async setChannelFields(channelId: number): Promise<void> {
        const allFields = [
            ArticleProperty.CUSTOMER_VISIBLE,
            ArticleProperty.FROM, ArticleProperty.TO, ArticleProperty.CC, ArticleProperty.BCC,
            ArticleProperty.SUBJECT, ArticleProperty.BODY, ArticleProperty.ATTACHMENTS
        ];
        if (channelId) {
            const channels = await KIXObjectService.loadObjects<Channel>(KIXObjectType.CHANNEL, [channelId])
                .catch((): Channel[] => []);
            const channel = Array.isArray(channels) && channels.length ? channels[0] : null;

            const noteFields = [
                ArticleProperty.CUSTOMER_VISIBLE, ArticleProperty.SUBJECT,
                ArticleProperty.BODY, ArticleProperty.ATTACHMENTS
            ];

            const mailFields = [
                ArticleProperty.CUSTOMER_VISIBLE,
                ArticleProperty.FROM, ArticleProperty.CC, ArticleProperty.BCC,
                ArticleProperty.SUBJECT, ArticleProperty.BODY, ArticleProperty.ATTACHMENTS,
                ArticleProperty.TO
            ];

            let submitPattern = 'Translatable#Save';
            if (channel?.Name === 'note') {
                this.disableChannelFormValues(allFields.filter((p) => !noteFields.includes(p)));
                this.enableChannelFormValues(channel.Name, noteFields);
            } else if (channel?.Name === 'email') {
                this.disableChannelFormValues(allFields.filter((p) => !mailFields.includes(p)));
                this.enableChannelFormValues(channel.Name, mailFields);
                submitPattern = 'Translatable#Send';
            }

            const context = this.objectValueMapper.objectFormHandler.context;
            context.setAdditionalInformation(AdditionalContextInformation.DIALOG_SUBMIT_BUTTON_TEXT, submitPattern);
        } else {
            this.disableChannelFormValues(allFields);
        }
    }

    private enableChannelFormValues(channelName: string, properties: ArticleProperty[]): void {
        for (const property of properties) {
            const formValue = this.formValues.find((fv) => fv.property === property);

            const isEdit = this.objectValueMapper.formContext === FormContext.EDIT;
            const showFormValue = property !== ArticleProperty.TO || isEdit;

            let showCc = false;

            if (property === ArticleProperty.CC) {
                const toValue = this.formValues.find((fv) => fv.property === ArticleProperty.TO);
                if (!toValue.enabled && !isEdit) {
                    showCc = true;
                }
            }

            if (formValue && showFormValue) {
                formValue.enabled = this.enabled;

                if (showCc) {
                    formValue.visible = true;
                }

                // make sure relevant properties are always required
                if (formValue.property === ArticleProperty.FROM || formValue.property === ArticleProperty.TO) {
                    formValue.required = channelName === 'email' && this.visible;
                }
            }
        }
    }

    private disableChannelFormValues(properties: ArticleProperty[]): void {
        for (const property of properties) {
            const formValue = this.formValues.find((fv) => fv.property === property);

            if (formValue) {
                formValue.enabled = false;
            }
        }
    }

    public async reset(): Promise<void> {
        return;
    }

}