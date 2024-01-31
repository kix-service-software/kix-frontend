/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { AbstractDynamicFormManager } from '../../../base-components/webapp/core/dynamic-form';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { JobProperty } from '../../../job/model/JobProperty';
import { AbstractJobFormManager } from '../../../job/webapp/core/AbstractJobFormManager';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { SearchService } from '../../../search/webapp/core';
import { TicketProperty } from '../../model/TicketProperty';
import { QueueService } from './admin';
import { TicketSearchFormManager } from './TicketSearchFormManager';

export class TicketJobFormManager extends AbstractJobFormManager {

    public getFilterManager(): AbstractDynamicFormManager {
        let filterManager;
        const searchDefinition = SearchService.getInstance().getSearchDefinition(KIXObjectType.TICKET);
        if (searchDefinition) {

            // use own manager to extend operators
            filterManager = new TicketJobFilterFormManager([SearchProperty.FULLTEXT], false);

            filterManager.init = (): void => {

                // get extended managers on init because they could be added after filterManager was created
                if (searchDefinition) {
                    filterManager['extendedFormManager'] = [];
                    searchDefinition.formManager.getExtendedFormManager().forEach(
                        (m) => filterManager.addExtendedFormManager(m)
                    );
                }
            };
            return filterManager;
        }
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        if (property === JobProperty.FILTER && Array.isArray(value)) {
            value.forEach((v: FilterCriteria) => {

                // backend mostly does not support a list value with equal operator
                if (v.operator === SearchOperator.EQUALS && Array.isArray(v.value)) {
                    v.value = v.value[0];
                }
            });
        }
        return [[property, value]];
    }
}

// tslint:disable-next-line:max-classes-per-file
class TicketJobFilterFormManager extends TicketSearchFormManager {

    // do not mark viewable states as required
    public handleViewableStateType: boolean = false;

    // TODO: extend Operators, remove if Operators are not limited anymore (Ticket.ts -> SEARCH_PROPERTIES)
    public async getOperations(property: string): Promise<Array<string | SearchOperator>> {
        return await super.getOperations(property);
    }

    public async getTreeNodes(property: string, objectIds?: Array<string | number>): Promise<TreeNode[]> {
        let nodes = [];
        switch (property) {
            case TicketProperty.QUEUE_ID:
                const queuesHierarchy = await QueueService.getInstance().getQueuesHierarchy(false);
                nodes = await QueueService.getInstance().prepareObjectTree(queuesHierarchy, true, true);
                break;
            default:
                nodes = await super.getTreeNodes(property, objectIds);
        }
        return nodes;
    }


}
