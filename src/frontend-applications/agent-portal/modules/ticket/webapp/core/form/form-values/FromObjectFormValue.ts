/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { TreeNode } from '../../../../../base-components/webapp/core/tree';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { SystemAddress } from '../../../../../system-address/model/SystemAddress';
import { AgentService } from '../../../../../user/webapp/core/AgentService';
import { Queue } from '../../../../model/Queue';
import { TicketProperty } from '../../../../model/TicketProperty';

export class FromObjectFormValue extends SelectObjectFormValue {

    private queueId: number;

    public constructor(
        property: string,
        object: any,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue
    ) {
        super(property, object, objectValueMapper, parent);

        this.hasFilter = false;

        this.objectValueMapper?.object?.addBinding(TicketProperty.QUEUE_ID, async (queueId: number) => {
            this.initNodes(queueId);
        });
    }

    public async loadSelectableValues(): Promise<void> {
        const queueValue = this.objectValueMapper.findFormValue(TicketProperty.QUEUE_ID);
        await this.initNodes(queueValue?.value);
    }

    private async initNodes(queueId: number): Promise<void> {
        if (queueId !== this.queueId) {
            this.queueId = queueId;
            const queues = await KIXObjectService.loadObjects<Queue>(KIXObjectType.QUEUE, [queueId]);
            if (queues?.length) {
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

                const nodes: TreeNode[] = labels.map((l) => {
                    const node = new TreeNode(l[0], l[1]);
                    node.tooltip = l[0];
                    return node;
                });

                this.treeHandler?.setTree(nodes);
                this.treeHandler?.setSelection(nodes?.length ? [nodes[0]] : [], true);

                if (nodes.length) {
                    this.setFormValue(nodes[0].id);
                }
            }
        } else if (!queueId && this.treeHandler) {
            this.treeHandler?.setTree([]);
            this.treeHandler?.selectNone();
            this.value = null;
        }

    }
}