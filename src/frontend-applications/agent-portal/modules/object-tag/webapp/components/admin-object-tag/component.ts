/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { TreeNode, TreeService } from '../../../../base-components/webapp/core/tree';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { ObjectTagProperty } from '../../../model/ObjectTagProperty';
import { ObjectTagService } from '../../core/ObjectTagService';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { IdService } from '../../../../../model/IdService';
import { QueueProperty } from '../../../../ticket/model/QueueProperty';
import { UIFilterCriterion } from '../../../../../model/UIFilterCriterion';
import { ObjectTagLink } from '../../../model/ObjectTagLink';
import { ObjectTagLinkProperty } from '../../../model/ObjectTagLinkProperty';
import { ActionFactory } from '../../../../base-components/webapp/core/ActionFactory';
import { AbstractAction } from '../../../../base-components/webapp/core/AbstractAction';
import { AdminContext } from '../../../../admin/webapp/core/AdminContext';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { Table } from '../../../../table/model/Table';
import { SysConfigOptionProperty } from '../../../../sysconfig/model/SysConfigOptionProperty';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private preparedObjects: Map<string,any[]>;
    private selectedTags: Array<string>;
    private nodes: TreeNode[];

    public async onCreate(): Promise<void> {
        this.state = new ComponentState();
        this.state.loadNodes = this.loadNodes.bind(this);
        this.state.searchCallback = this.doAutocompleteSearch.bind(this);
        this.state.actions = await this.getActions();
    }

    public async onMount(): Promise<void> {
        await this.search();
    }

    public async loadNodes(): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        nodes = ContextService.getInstance().getActiveContext<AdminContext>().getAdditionalInformation('tagNodes');
        this.nodes = nodes;
        return nodes;
    }

    public async doAutocompleteSearch(limit: number, searchValue: string): Promise<TreeNode[]> {
        let tree: TreeNode[];
        let loadingOptions: KIXObjectLoadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.limit = 0;
        loadingOptions.searchLimit = 0;
        loadingOptions.filter = [
            new FilterCriteria(
                ObjectTagProperty.NAME, SearchOperator.LIKE, FilterDataType.STRING,
                FilterType.AND, `*${searchValue}*`
            )
        ];

        tree = await KIXObjectService.searchObjectTree(
            KIXObjectType.OBJECT_TAG, ObjectTagProperty.NAME, `*${searchValue}*`, loadingOptions
        );

        return tree;
    }
    public async search(): Promise<void> {
        this.state.prepared = false;
        this.state.tables = [];
        this.preparedObjects = new Map();

        const treeHandler = TreeService.getInstance().getTreeHandler('object-tag-value');
        let nodes: TreeNode[] = treeHandler?.getSelectedNodes();

        if ( !nodes?.length && this.nodes?.length ) {
            nodes = this.nodes;
            this.nodes = [];
        }

        if ( nodes?.length ) {
            this.selectedTags = nodes.map( (n) => n.id);
            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.limit = 0;
            loadingOptions.searchLimit = 0;
            loadingOptions.filter = [
                new FilterCriteria(
                    ObjectTagLinkProperty.NAME, SearchOperator.IN, FilterDataType.STRING,
                    FilterType.AND, this.selectedTags
                )
            ];
            const tags = await KIXObjectService.loadObjects<ObjectTagLink>(
                KIXObjectType.OBJECT_TAG_LINK, null,loadingOptions,
                null,null,false
            ).catch( () => [] );

            if ( tags?.length ) {
                await this.prepareObjects(tags);
                await this.prepareTable();
            }
        }

        ContextService.getInstance().getActiveContext().setAdditionalInformation('tagNodes', nodes);

        return null;
    }

    private async prepareObjects(tags: ObjectTagLink[]): Promise<void> {
        const types = await KIXObjectService.prepareObjectTagTypes(true);
        tags.forEach( (o) => {
            const type = types.has(o.ObjectType) ? types.get(o.ObjectType) : o.ObjectType;
            if (this.preparedObjects.has(type)) {
                const objectIds = this.preparedObjects.get(type);
                if ( !objectIds.includes( o.ObjectID) ) {
                    objectIds.push(o.ObjectID);
                }
            }
            else {
                this.preparedObjects.set(type,[o.ObjectID]);
            }
        });
    }
    private async prepareTable(): Promise<void> {
        const createPromises = [];
        const objects = [];
        for( const object of this.preparedObjects ) {
            createPromises.push(
                TableFactoryService.getInstance().createTable(
                `table-object-tag-${object[0]}`, object[0], null, object[1], null, true
                )
            );
            objects.push(object);
        }
        const tables = await Promise.all(createPromises);
        tables.forEach( (table,index) => {
            if ( typeof table !== 'undefined' ) {
                table.getTableConfiguration().enableSelection = Boolean(this.state.actions);
                table['title'] = LabelService.getInstance().getObjectName(objects[index][0], true, true);
                table['instanceId'] = IdService.generateDateBasedId();
                this.setSpecialFilter(table, objects[index][1]);
                this.state.tables.push(table);
            }
        });
        this.state.prepared = true;
    }

    private async getActions(): Promise<AbstractAction[]> {
        const actions = await ActionFactory.getInstance().getActionsForType(KIXObjectType.OBJECT_TAG);
        const filteredActions: AbstractAction[] = [];
        for (const a of actions) {
            if (await a.canShow()) {
                filteredActions.push(a);
            }
        }
        return filteredActions;
    }

    private async setSpecialFilter(table: Table, value: any): Promise<void> {
        const objectType = table.getObjectType();
        switch (objectType) {
            case KIXObjectType.QUEUE:
                table.setFilter(
                    null,
                    [
                        new UIFilterCriterion(
                            QueueProperty.QUEUE_ID, SearchOperator.IN, value,
                            true
                        )
                    ]
                );
                table.filter();
                break;
            case KIXObjectType.SYS_CONFIG_OPTION_DEFINITION:
                table.setFilter(
                    null,
                    [
                        new UIFilterCriterion(
                            SysConfigOptionProperty.ID, SearchOperator.IN, value,
                            true
                        )
                    ]
                );
                table.filter();
                break;
            default:
        }
    }

    public runAction(action:AbstractAction): void {
        action.setData({
            tables: this.state.tables,
            tags: this.selectedTags,
            objects: this.preparedObjects
        });
        action.run(null);
    }
}

module.exports = Component;