/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { TreeNode } from '../../../../../base-components/webapp/core/tree';
import { Notification } from '../../../../../notification/model/Notification';
import { NotificationProperty } from '../../../../../notification/model/NotificationProperty';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { UserPreference } from '../../../../../user/model/UserPreference';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { FormValueProperty } from '../../../../../object-forms/model/FormValueProperty';

export class NotificationFormValue extends SelectObjectFormValue<string[]> {

    public constructor(
        property: string,
        public preference: UserPreference,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, preference, objectValueMapper, parent);

        this.label = 'Translatable#Notifications for Tickets';
        this.objectType = KIXObjectType.NOTIFICATION;
        this.maxSelectCount = -1;
        this.loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                'Data.' + NotificationProperty.DATA_VISIBLE_FOR_AGENT,
                SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 1
            )
        ]);

        if (preference?.Value) {
            const notifications = JSON.parse(preference.Value);
            const value = [];
            for (const key in notifications) {
                if (notifications[key]) {
                    value.push(key);
                }
            }
            this.value = value;
        }

        this.setNewInitialState(FormValueProperty.VISIBLE, true);
    }

    protected async prepareSelectableNodes(notifications: Notification[]): Promise<void> {
        const transport = 'Email';
        const nodes: TreeNode[] = [];
        for (const n of notifications) {
            const node = new TreeNode(`Notification-${n.ID}-${transport}`);
            node.label = await TranslationService.translate(n.Name);
            nodes.push(node);
        }

        this.treeHandler?.setTree(nodes, undefined, true, true);
    }

    public async loadSelectedValues(): Promise<void> {

        if (Array.isArray(this.value) && this.value?.length) {
            const ids = this.value.map((v) => v.split('-')[1]);
            const notifications = await KIXObjectService.loadObjects<Notification>(
                KIXObjectType.NOTIFICATION, ids
            ).catch((): Notification[] => []);

            const selectedNodes = [];
            const transport = 'Email';
            for (const n of notifications) {
                const label = await TranslationService.translate(n.Name);
                const node = new TreeNode(`Notification-${n.ID}-${transport}`, label);
                selectedNodes.push(node);
            }
            this.selectedNodes = selectedNodes.sort((a, b) => a.Name - b.Name);
        } else {
            this.selectedNodes = [];
        }

    }

    public async setObjectValue(value: string[]): Promise<void> {
        const preferencesValue = {};
        if (Array.isArray(value) && value?.length) {
            for (const v of value) {
                preferencesValue[v] = 1;
            }
        }
        this.preference.Value = JSON.stringify(preferencesValue);
    }

    public async enable(): Promise<void> {
        await super.enable();
        for (const fv of this.formValues) {
            await fv.enable();
        }
    }

}