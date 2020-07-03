/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../model/ContextType';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../../model/ContextMode';
import { TicketDetailsContext } from '../../core';
import { Ticket } from '../../../model/Ticket';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { TicketProperty } from '../../../model/TicketProperty';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Queue } from '../../../model/Queue';
import { AgentService } from '../../../../user/webapp/core';
import { SystemAddress } from '../../../../system-address/model/SystemAddress';
import { TreeNode, TreeHandler } from '../../../../base-components/webapp/core/tree';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';

class Component extends FormInputComponent<number, ComponentState> {

    private formSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        const objectTypes = context.getDescriptor().kixObjectTypes;
        const contextMode = context.getDescriptor().contextMode;

        if (objectTypes.some((ot) => ot === KIXObjectType.ARTICLE) && contextMode === ContextMode.CREATE_SUB) {
            this.initValuesByContext();
        } else if (objectTypes.some((ot) => ot === KIXObjectType.TICKET)
            && (contextMode === ContextMode.EDIT || contextMode === ContextMode.CREATE)) {
            this.initValuesByForm();
        }

        this.formSubscriber = {
            eventSubscriberId: 'ArticleEmailFromInput',
            eventPublished: (data: FormValuesChangedEventData, eventId: string) => {
                const queueValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === TicketProperty.QUEUE_ID
                );
                if (queueValue && queueValue[1] && queueValue[1].value) {
                    this.initNodes(queueValue[1].value);
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    private async initValuesByContext(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
            TicketDetailsContext.CONTEXT_ID
        );

        if (context) {
            const ticket = await context.getObject<Ticket>();
            if (ticket) {
                this.initNodes(ticket.QueueID);
            }
        }
    }

    private async initValuesByForm(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const queueValue = await formInstance.getFormFieldValueByProperty<number>(TicketProperty.QUEUE_ID);
        if (queueValue && queueValue.value) {
            this.initNodes(queueValue.value);
        }
    }

    public async setCurrentValue(): Promise<void> {
        return;
    }

    private async initNodes(queueId: number): Promise<void> {
        const queues = await KIXObjectService.loadObjects<Queue>(KIXObjectType.QUEUE, [queueId]);
        if (queues && queues.length) {
            const user = await AgentService.getInstance().getCurrentUser();

            const queue = queues[0];

            let userName = user.Contact ? `${user.Contact.Firstname} ${user.Contact.Lastname}` : user.UserLogin;
            userName = userName
                .replace(/ä/g, 'ae').replace(/Ä/g, 'Ae')
                .replace(/ö/g, 'oe').replace(/Ö/g, 'Oe')
                .replace(/ü/g, 'ue').replace(/Ü/g, 'Ue');

            const systemAddress = await KIXObjectService.loadObjects<SystemAddress>(
                KIXObjectType.SYSTEM_ADDRESS, [queue.SystemAddressID], null, null, true
            );
            const queueMail = systemAddress[0].Name;
            let realName = systemAddress[0].Realname;
            realName = realName
                .replace(/ä/g, 'ae').replace(/Ä/g, 'Ae')
                .replace(/ö/g, 'oe').replace(/Ö/g, 'Oe')
                .replace(/ü/g, 'ue').replace(/Ü/g, 'Ue');

            const labels = [
                [`\"${realName}\" <${queueMail}>`, `${realName}`],
                [`${userName} \"via\" ${realName} <${queueMail}>`, `${userName} via ${realName}`],
                [`${userName} <${queueMail}>`, `${userName}`]
            ];

            const nodes: TreeNode[] = [];
            labels.forEach((l) => nodes.push(
                new TreeNode(
                    l[0], l[1], null, null, null, null, null, null, null,
                    undefined, undefined, undefined, undefined, l[0]
                )
            ));

            const formList = (this as any).getComponent('article-email-from-input');
            if (formList) {
                const treeHandler: TreeHandler = formList.getTreeHandler();
                if (treeHandler) {
                    treeHandler.setTree(nodes);
                    treeHandler.setSelection([nodes[0]], true);
                }
            }
        }
    }

    public nodesChanged(nodes: TreeNode[]): void {
        const currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(currentNode ? currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
