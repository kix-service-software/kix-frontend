/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { TreeHandler, TreeService, TreeNode } from '../../../../base-components/webapp/core/tree';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AutoCompleteConfiguration } from '../../../../../model/configuration/AutoCompleteConfiguration';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { SystemAddress } from '../../../../system-address/model/SystemAddress';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { FormInputAction } from '../../../../../modules/base-components/webapp/core/FormInputAction';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { Article } from '../../../model/Article';
import { ArticleReceiver } from '../../../model/ArticleReceiver';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { IKIXObjectService } from '../../../../../modules/base-components/webapp/core/IKIXObjectService';
import { Contact } from '../../../../customer/model/Contact';

class Component extends FormInputComponent<string[], ComponentState> {

    private ccSubscriber: IEventSubscriber;
    private ccReadySubscriber: IEventSubscriber;
    private treeHandler: TreeHandler;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        this.treeHandler = new TreeHandler([], null, null, true);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, this.treeHandler);
        await super.onMount();
        this.state.searchCallback = this.searchContacts.bind(this);
        const objectName = await LabelService.getInstance().getObjectName(KIXObjectType.CONTACT, true, false);
        this.state.autoCompleteConfiguration = new AutoCompleteConfiguration(10, 2000, 3, objectName);

        await this.prepareActions();

        if (this.state.field?.property === ArticleProperty.CC) {
            this.ccSubscriber = {
                eventSubscriberId: 'article-email-cc-recipient-input',
                eventPublished: (data: any, eventId: string) => {
                    const newCcNodes = this.prepareMailNodes(data ? data.ccList : null, data ? data.filterList : null);
                    this.treeHandler.setSelection(newCcNodes, true, true, true);
                    this.contactChanged(newCcNodes);
                }
            };
            EventService.getInstance().subscribe('SET_CC_RECIPIENTS', this.ccSubscriber);
            EventService.getInstance().publish('CC_READY');

            const bccAction = this.state.actions.find((a) => a.id === ArticleProperty.BCC);
            if (bccAction) {
                const context = ContextService.getInstance().getActiveContext();
                const formInstance = await context?.getFormManager()?.getFormInstance();
                const bccValue = await formInstance.getFormFieldValueByProperty(ArticleProperty.BCC);
                if (bccValue && bccValue.value) {
                    this.actionClicked(bccAction);
                }
            }
        }

        this.state.prepared = true;
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
        EventService.getInstance().unsubscribe('SET_CC_RECIPIENTS', this.ccSubscriber);
        EventService.getInstance().unsubscribe('CC_READY', this.ccReadySubscriber);
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = this.state.field ? formInstance.getFormFieldValue<number>(this.state.field.instanceId) : null;
        if (value && value.value) {
            let contactValues: any[] = Array.isArray(value.value) ? [...value.value] : [value.value];
            contactValues = contactValues.map((v) => v.replace(/.+ <(.+)>/, '$1'));

            const emailAddresses = contactValues.filter((v) => isNaN(v));
            const contactIds = contactValues.filter((v) => !isNaN(v) && v !== '' && v !== null).map((v) => Number(v));

            let nodes: TreeNode[] = [];
            let contacts: Contact[] = [];
            if (contactIds.length) {
                contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, contactIds);
                nodes = await this.createTreeNodes(contacts);
            }

            let mailNodes: TreeNode[] = [];
            let mailContacts: Contact[] = [];
            if (emailAddresses.length) {
                mailContacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, null,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                'Email', SearchOperator.IN, FilterDataType.STRING,
                                FilterType.OR, emailAddresses
                            )
                        ]

                    ), null, true
                );

                mailNodes = await this.createTreeNodes(mailContacts);

                const unknownMailAddresses = emailAddresses.filter((ea) => !mailContacts.some((c) => c.Email === ea));
                mailNodes = [...mailNodes, ...unknownMailAddresses.map((ma) => new TreeNode(ma, ma))];
            }

            nodes = [...nodes, ...mailNodes];

            const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
                KIXObjectType.SYSTEM_ADDRESS
            );

            const unknownNodes = contactValues.filter((v) =>
                typeof v !== 'undefined' && v !== '' && v !== null &&
                !contacts.some((c) => c.ID === Number(v) || c.Email === v) &&
                !mailContacts.some((c) => c.ID === v || c.Email === v) &&
                !systemAddresses.some((sa) => sa.Name === v)
            ).map((n) => new TreeNode(n, n));
            nodes = [...nodes, ...unknownNodes];

            this.treeHandler.setSelection(nodes, true, true);
        }
    }

    private async prepareActions(): Promise<void> {
        const additionalTypeOption = this.state.field?.options?.find((o) => o.option === 'ADDITIONAL_RECIPIENT_TYPES');
        const actions = [];
        if (additionalTypeOption && additionalTypeOption.value && Array.isArray(additionalTypeOption.value)) {
            const context = ContextService.getInstance().getActiveContext();
            const formInstance = await context?.getFormManager()?.getFormInstance();
            for (const property of additionalTypeOption.value) {
                const label = await LabelService.getInstance().getPropertyText(
                    property, KIXObjectType.ARTICLE
                );
                const currentValue = formInstance ? await formInstance.getFormFieldValueByProperty(property) : null;
                const action = new FormInputAction(
                    property, new Label(null, property, null, label), this.actionClicked.bind(this),
                    currentValue ? true : false
                );
                actions.push(action);
            }
        }
        if (this.state.field?.property === ArticleProperty.TO) {
            const replyAllAction = await this.getReplyAllAction();
            if (replyAllAction) {
                actions.push(replyAllAction);
            }
        }
        this.state.actions = actions;
    }

    private async getReplyAllAction(): Promise<FormInputAction> {
        let action: FormInputAction;
        const context = ContextService.getInstance().getActiveContext();
        const articleId = context?.getAdditionalInformation('REFERENCED_ARTICLE_ID');
        if (articleId) {
            action = new FormInputAction(
                'ReplyAll', new Label(null, 'ReplyAll', 'kix-icon-mail-answerall-outline', null, null,
                    await TranslationService.translate('Translatable#Reply all')
                ),
                this.actionClicked.bind(this), false, false
            );
        }
        return action;
    }

    private async actionClicked(action: FormInputAction): Promise<void> {
        if (action.id === 'ReplyAll') {
            await this.handleReplyAll();
        } else {
            const context = ContextService.getInstance().getActiveContext();
            const formInstance = await context?.getFormManager()?.getFormInstance();
            let field = this.state.field.children.find((f) => f.property === action.id);
            if (field) {
                formInstance.removeFormField(field);
                action.active = false;
            } else {
                const label = await LabelService.getInstance().getPropertyText(action.id, KIXObjectType.ARTICLE);
                const helpText = action.id === ArticleProperty.CC
                    ? 'Translatable#Helptext_Tickets_ArticleCreate_ReceiverCc'
                    : 'Translatable#Helptext_Tickets_ArticleCreate_ReceiverBcc';
                field = new FormFieldConfiguration(
                    'recipinet-field',
                    label, action.id, 'article-email-recipient-input', false, helpText
                );
                await formInstance.addFieldChildren(this.state.field, [field]);
                action.active = true;
            }
            (this as any).setStateDirty('actions');
        }
    }

    private async handleReplyAll(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const dialogContext = ContextService.getInstance().getActiveContext();
        if (this.state.field.property === ArticleProperty.TO && context && dialogContext) {
            const replyId = dialogContext.getAdditionalInformation('REFERENCED_ARTICLE_ID');
            const articles = await context.getObjectList<Article>(KIXObjectType.ARTICLE);
            if (replyId && articles && articles.length) {
                const replyArticle = articles.find((a) => a.ArticleID === replyId);
                if (replyArticle) {
                    const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
                        KIXObjectType.SYSTEM_ADDRESS
                    );
                    const newToNodes = this.prepareMailNodes(replyArticle.toList, systemAddresses.map((sa) => sa.Name));
                    this.treeHandler.setSelection(newToNodes, true, true, true);
                    this.contactChanged(newToNodes);

                    this.handleCcField(
                        replyArticle,
                        [...newToNodes.map((n) => n.id), ...systemAddresses.map((sa) => sa.Name)]
                    );
                }
            }
        }
    }

    private async handleCcField(replyArticle: Article, filterList: string[]): Promise<void> {
        const ccAction = this.state.actions.find((a) => a.id === ArticleProperty.CC);
        if (ccAction) {
            const ccField = this.state.field.children.find((f) => f.property === ArticleProperty.CC);
            if (!ccField) {
                this.ccReadySubscriber = {
                    eventSubscriberId: 'article-email-to-recipient-input',
                    eventPublished: (data: any, eventId: string) => {
                        EventService.getInstance().publish('SET_CC_RECIPIENTS', {
                            ccList: replyArticle.ccList,
                            filterList
                        });
                        EventService.getInstance().unsubscribe('CC_READY', this.ccReadySubscriber);
                    }
                };
                EventService.getInstance().subscribe('CC_READY', this.ccReadySubscriber);
                await this.actionClicked(ccAction);
            } else {
                EventService.getInstance().publish('SET_CC_RECIPIENTS', {
                    ccList: replyArticle.ccList,
                    filterList
                });
            }
        }
    }

    private prepareMailNodes(receiverList: ArticleReceiver[], filterList: string[] = []): TreeNode[] {
        const nodes: TreeNode[] = this.treeHandler.getVisibleNodes();
        if (Array.isArray(receiverList)) {
            for (const receiver of receiverList) {
                const email = receiver.email.replace(/.+ <(.+)>/, '$1');
                if (!nodes.some((n) => n.id === email)) {
                    nodes.push(new TreeNode(email, receiver.email, 'kix-icon-man-bubble'));
                }
            }
        }
        return nodes.filter((n) => !filterList.some((f) => f === n.id));
    }

    public contactChanged(nodes: TreeNode[]): void {
        nodes = nodes ? nodes : [];
        super.provideValue(nodes.map((n) => n.id));
    }

    private async searchContacts(limit: number, searchValue: string): Promise<TreeNode[]> {
        let nodes = [];
        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(KIXObjectType.CONTACT);
        if (service) {
            const filter = await service.prepareFullTextFilter(searchValue);
            const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, null, loadingOptions, null, false
            );

            if (searchValue && searchValue !== '') {
                nodes = await this.createTreeNodes(contacts.filter((co) => co.Email));
            }
        }

        return nodes;
    }

    private async createTreeNodes(contacts: Contact[]): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        for (const contact of contacts) {
            const displayValue = await LabelService.getInstance().getObjectText(contact);
            nodes.push(
                new TreeNode(
                    contact.Email, displayValue, 'kix-icon-man-bubble', null, null, null,
                    null, null, null, null, undefined, undefined, undefined,
                    `"${contact['Firstname']} ${contact['Lastname']}" <${contact['Email']}>`
                )
            );
        }
        return nodes;
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
