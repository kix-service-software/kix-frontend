/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Queue } from '../../../model/Queue';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../../model/KIXObjectSpecificLoadingOptions';
import { QueueProperty } from '../../../model/QueueProperty';
import { TreeNode, TreeNodeProperty } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FollowUpType } from '../../../model/FollowUpType';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';

export class QueueService extends KIXObjectService<Queue> {

    private static INSTANCE: QueueService = null;

    public static getInstance(): QueueService {
        if (!QueueService.INSTANCE) {
            QueueService.INSTANCE = new QueueService();
        }

        return QueueService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.QUEUE);
        this.objectConstructors.set(KIXObjectType.QUEUE, [Queue]);
        this.objectConstructors.set(KIXObjectType.FOLLOW_UP_TYPE, [FollowUpType]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.QUEUE
            || kixObjectType === KIXObjectType.FOLLOW_UP_TYPE;
    }

    public getLinkObjectName(): string {
        return 'Queue';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.FOLLOW_UP_TYPE) {
            objects = await super.loadObjects<O>(KIXObjectType.FOLLOW_UP_TYPE, null, loadingOptions);
        } else {
            if (!loadingOptions) {
                objects = await super.loadObjects<O>(objectType, null);
            } else {
                superLoad = true;
                objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
            }
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    public async prepareObjectTree(
        queues: Queue[], showInvalid?: boolean, invalidClickable: boolean = false,
        filterIds?: number[], translatable?: boolean, useTextAsId?: boolean, includeTicketStats: boolean = false
    ): Promise<TreeNode[]> {
        const nodes = [];
        if (queues && !!queues.length) {
            if (!invalidClickable || !showInvalid) {
                queues = queues.filter((q) => q.ValidID === 1 || this.hasValidDescendants(q.SubQueues));
            }

            if (filterIds && filterIds.length) {
                queues = queues.filter((q) => !filterIds.some((fid) => fid === q.QueueID));
            }

            for (const queue of queues) {
                let ticketStats = null;
                if (includeTicketStats) {
                    ticketStats = await this.getTicketStats(queue);
                }

                const subTree = await this.prepareObjectTree(
                    queue.SubQueues, showInvalid, invalidClickable, filterIds, translatable,
                    useTextAsId, includeTicketStats
                );

                const icon = LabelService.getInstance().getObjectIcon(queue);
                const label = await LabelService.getInstance().getObjectText(queue, false, useTextAsId);

                const treeNode = new TreeNode(queue.QueueID, label, icon);
                treeNode.children = subTree;
                treeNode.properties = ticketStats;
                treeNode.selectable = invalidClickable ? true : queue.ValidID === 1;
                treeNode.showAsInvalid = queue.ValidID !== 1;

                nodes.push(treeNode);
            }
        }

        SortUtil.sortObjects(nodes, 'label', DataType.STRING);

        return nodes;
    }

    private hasValidDescendants(queues: Queue[]): boolean {
        let hasValidDescendants: boolean = false;
        if (queues && !!queues.length) {
            for (const queue of queues) {
                if (queue.ValidID === 1) {
                    hasValidDescendants = true;
                } else {
                    hasValidDescendants = this.hasValidDescendants(queue.SubQueues);
                }
                if (hasValidDescendants) {
                    break;
                }
            }
        }
        return hasValidDescendants;
    }

    private async getTicketStats(queue: Queue): Promise<TreeNodeProperty[]> {
        const properties: TreeNodeProperty[] = [];
        if (queue.TicketStats) {
            const totalCount = queue.TicketStats.TotalCount;
            const totalTooltip = await TranslationService.translate('Translatable#All tickets', [totalCount]);

            const freeCount = totalCount - queue.TicketStats.LockCount;
            const freeTooltip = await TranslationService.translate(
                'Translatable#All free tickets', [totalCount - freeCount]
            );

            properties.push(new TreeNodeProperty(freeCount, freeTooltip));
            properties.push(new TreeNodeProperty(totalCount, totalTooltip));
        }

        return properties;
    }

    public async getQueuesHierarchy(withData: boolean = true): Promise<Queue[]> {
        let queueTree: Queue[] = [];
        const loadingOptions = new KIXObjectLoadingOptions();
        if (withData) {
            loadingOptions.includes = ['TicketStats'];
            loadingOptions.query = [['TicketStats.StateType', 'Open']];
        }

        loadingOptions.cacheType = 'QUEUE_HIERARCHY';

        const loadedQueues = await KIXObjectService.loadObjects<Queue>(KIXObjectType.QUEUE, null, loadingOptions)
            .catch((): Queue[] => []);
        if (loadedQueues?.length) {
            const queues = loadedQueues.map((q) => new Queue(q));

            for (const queue of queues) {
                if (queue.ParentID) {
                    const parent = queues.find((q) => q.QueueID === queue.ParentID);
                    if (parent) {
                        if (!Array.isArray(parent.SubQueues)) {
                            parent.SubQueues = [];
                        }

                        parent.SubQueues.push(queue);
                    } else {
                        // mark this queue, so that we can build the pseudo structure later
                        queue.ParentID = -1;
                    }
                }
            }

            const pseudoQueues = queues.filter((q) => q.ParentID === -1);
            for (const queue of pseudoQueues) {
                this.buildPseudoQueueStructure(queue.Fullname, queue, queues);
            }

            queueTree = queues.filter((q) => !q.ParentID);
        }

        return queueTree;
    }

    private buildPseudoQueueStructure(fullName: string, queue: Queue, queues: Queue[]): void {
        const names = fullName.split('::').filter((n) => n !== queue.Name);
        if (names.length && names[0] !== '') {
            const queueName = names[0];
            let parent = queues.find((q) => q.Name === queueName);
            if (!parent) {
                parent = new Queue();
                parent.QueueID = -1;
                parent.Name = queueName;
                parent.ValidID = 2;
                parent.SubQueues = [];
                parent.Fullname = fullName;
                queues.push(parent);
            }

            const newFullname = names.filter((n) => n !== names[0]).join('::');
            this.buildPseudoQueueStructure(newFullname, queue, parent.SubQueues);
        } else {
            queues.push(queue);
        }

    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean,
        filterIds?: Array<string | number>, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<TreeNode[]> {
        const values: TreeNode[] = [];

        switch (property) {
            case QueueProperty.FOLLOW_UP_ID:
                let followUpTypes = await KIXObjectService.loadObjects<FollowUpType>(KIXObjectType.FOLLOW_UP_TYPE);
                if (!showInvalid) {
                    followUpTypes = followUpTypes.filter((q) => q.ValidID === 1);
                }
                for (const type of followUpTypes) {
                    values.push(new TreeNode(type.ID, await TranslationService.translate(type.Name)));
                }
                break;
            default:
        }

        return values;
    }
}
