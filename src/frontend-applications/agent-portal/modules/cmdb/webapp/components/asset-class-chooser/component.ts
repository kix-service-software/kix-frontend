/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ConfigItemClass } from '../../../model/ConfigItemClass';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterType } from '../../../../../model/FilterType';
import { ConfigItemProperty } from '../../../model/ConfigItemProperty';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';
import { NewConfigItemDialogContext } from '../../core';

export class Component {

    private state: ComponentState;

    private context: NewConfigItemDialogContext;

    public listenerId: string;

    public textFilterValue: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.listenerId = IdService.generateDateBasedId('asset-class-chooser-');
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext<NewConfigItemDialogContext>();
        this.state.widgetConfiguration = await this.context.getWidgetConfiguration(this.state.instanceId);

        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, 1
            )
        ]);
        const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS, null, loadingOptions, null, false
        ).catch((): ConfigItemClass[] => []);
        this.state.nodes = await this.prepareTreeNodes(ciClasses);

        const formInstance = await this.context.getFormManager().getFormInstance();
        const classId = this.context.getAdditionalInformation(ConfigItemProperty.CLASS_ID);
        if (classId) {
            this.activeNodeChanged(this.state.nodes.find((n) => n.id === classId));
        } else if (!formInstance && this.state.nodes?.length) {
            this.activeNodeChanged(this.state.nodes[0]);
        } else if (this.state.nodes?.length) {
            const classIdValue = await formInstance.getFormFieldValueByProperty(ConfigItemProperty.CLASS_ID);
            if (classIdValue?.value) {
                this.state.activeNode = this.state.nodes.find((n) => n.id === classIdValue.value);
            }
        }
    }

    private async prepareTreeNodes(configItemClasses: ConfigItemClass[]): Promise<TreeNode[]> {
        const nodes = [];
        if (configItemClasses) {
            for (const c of configItemClasses) {
                const name = await TranslationService.translate(c.Name, []);
                const icon = LabelService.getInstance().getObjectIcon(c);
                nodes.push(new TreeNode(c.ID, name, icon));
            }
        }

        SortUtil.sortObjects(nodes, 'label', DataType.STRING);

        return nodes;
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;
        this.context?.setClassId(node?.id);
    }

    public async filter(textFilterValue?: string): Promise<void> {
        this.state.filterValue = textFilterValue;
    }

}

module.exports = Component;
