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
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { AbstractDynamicFormManager } from '../../../base-components/webapp/core/dynamic-form';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { DynamicFieldProperty } from '../../../dynamic-fields/model/DynamicFieldProperty';
import { JobProperty } from '../../../job/model/JobProperty';
import { AbstractJobFormManager } from '../../../job/webapp/core/AbstractJobFormManager';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { SearchService } from '../../../search/webapp/core';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { ContactSearchFormManager } from './ContactSearchFormManager';

export class ContactJobFormManager extends AbstractJobFormManager {

    public getFilterManager(): AbstractDynamicFormManager {
        let filterManager;
        const searchDefinition = SearchService.getInstance().getSearchDefinition(KIXObjectType.CONTACT);
        if (searchDefinition) {

            // use own manager to extend operators
            filterManager = new ContactJobFilterFormManager([SearchProperty.FULLTEXT], false);

            filterManager.init = (): void => {

                // get extended managers on init because they could be added after filterManager was created
                if (searchDefinition) {
                    filterManager['extendedFormManager'] = [];
                    searchDefinition.formManager.getExtendedFormManager().forEach(
                        (m) => filterManager.addExtendedFormManager(m)
                    );
                }
            };
        }
        return filterManager;
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

    public async getEventNodes(): Promise<TreeNode[]> {
        const contactEvents = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.CONTACT_EVENTS], null, null, true
        ).catch((error): SysConfigOption[] => []);

        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                DynamicFieldProperty.OBJECT_TYPE, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, KIXObjectType.CONTACT
            )
        ]);
        const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions, null, true
        ).catch(() => [] as DynamicField[]);

        const dfEvents = dynamicFields ? dynamicFields.map((d) => `ContactDynamicFieldUpdate_${d.Name}`) : [];

        let nodes = [];
        if (contactEvents && contactEvents.length) {
            nodes = contactEvents[0].Value.map((event: string) => {
                return new TreeNode(event, event);
            });
        }
        if (dfEvents && dfEvents.length) {
            nodes = [
                ...nodes,
                ...dfEvents.map((event: string) => {
                    return new TreeNode(event, event);
                })
            ];
        }
        return nodes;
    }
}

// tslint:disable-next-line:max-classes-per-file
class ContactJobFilterFormManager extends ContactSearchFormManager {

    // TODO: extend Operators, remove if Operators are not limited anymore (Contact.ts -> SEARCH_PROPERTIES)
    public async getOperations(property: string): Promise<Array<string | SearchOperator>> {
        return await super.getOperations(property);
    }

}
