/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { Ticket } from '../../../model/Ticket';
import { TicketProperty } from '../../../model/TicketProperty';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { Queue } from '../../../model/Queue';
import { SystemAddress } from '../../../../system-address/model/SystemAddress';
import { TreeHandler, TreeNode } from '../../../../base-components/webapp/core/tree';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { AgentService } from '../../../../user/webapp/core/AgentService';

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
        const placeholderText = this.state.field?.placeholder
            ? this.state.field?.placeholder
            : this.state.field?.required ? this.state.field?.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.formSubscriber = {
            eventSubscriberId: 'ArticleEmailFromInput',
            eventPublished: (data: FormValuesChangedEventData, eventId: string): void => {
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

    public async setCurrentValue(): Promise<void> {
        let queueId: number;
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const queueValue = await formInstance.getFormFieldValueByProperty<number>(TicketProperty.QUEUE_ID);
        if (queueValue && queueValue.value) {
            queueId = queueValue.value;
        } else if (context) {
            const ticket = await context.getObject<Ticket>(KIXObjectType.TICKET);
            if (ticket) {
                queueId = ticket.QueueID;
            }
        }

        if (queueId) {
            this.initNodes(queueId);
        }
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
                    const context = ContextService.getInstance().getActiveContext();
                    const formInstance = await context?.getFormManager()?.getFormInstance();
                    const value =
                        this.state.field ? formInstance.getFormFieldValue<number>(this.state.field?.instanceId) : null;
                    const node = nodes.find((n) => n.id === value?.value) || nodes[0];
                    treeHandler.setTree(nodes);
                    treeHandler.setSelection([node], true);
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
