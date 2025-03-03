/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { LinkTypeDescription } from '../../../model/LinkTypeDescription';
import { CreateLinkDescription } from '../../../server/api/CreateLinkDescription';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { TreeNode, TreeService } from '../../../../base-components/webapp/core/tree';
import { EditLinkedObjectsDialogContext, LinkService } from '../../core';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { LinkType } from '../../../model/LinkType';
import { Table } from '../../../../table/model/Table';
import { TableEvent } from '../../../../table/model/TableEvent';
import { TableEventData } from '../../../../table/model/TableEventData';
import { ValueState } from '../../../../table/model/ValueState';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { SearchService } from '../../../../search/webapp/core';
import { IdService } from '../../../../../model/IdService';

class LinkDialogComponent {

    private state: ComponentState;
    private linkTypeDescriptions: LinkTypeDescription[] = [];
    private newLinks: CreateLinkDescription[] = [];
    private linkPartners: Array<[string, KIXObjectType]> = [];
    private rootObject: KIXObject = null;
    public selectedObjects: KIXObject[] = [];

    private linkLabel: string;

    private tableSubscriber: IEventSubscriber;

    private objectType: KIXObjectType;

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.loadNodes = this.loadNodes.bind(this);
    }

    public onInput(input: any): void {
        if (!this.state.linkDescriptions || this.state.linkDescriptions.length === 0) {
            this.state.linkDescriptions = input.linkDescriptions || [];
        }
        this.newLinks = [];
        this.objectType = input.objectType;
        this.rootObject = input.rootObject;
    }

    public async onMount(): Promise<void> {
        this.selectedObjects = [];

        this.state.translations = await TranslationService.createTranslationObject(
            ['Translatable#Link to', 'Translatable#Search']
        );

        WidgetService.getInstance().setWidgetType('link-object-dialog-form-widget', WidgetType.GROUP);

        this.setLinkTypes();

        this.setSubmitState();
    }

    public async onDestroy(): Promise<void> {
        this.state.linkDescriptions = null;
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.REFRESH, this.tableSubscriber);
    }

    private async loadNodes(): Promise<TreeNode[]> {
        this.linkPartners = await LinkService.getPossibleLinkPartners(this.objectType);

        const nodes: TreeNode[] = [];
        for (const lp of this.linkPartners) {
            const formId = await FormService.getInstance().getFormIdByContext(FormContext.LINK, lp[1]);
            const icon = await LabelService.getInstance().getObjectTypeIcon(lp[1]);
            if (formId) {
                const node = new TreeNode(formId, lp[0], icon);
                nodes.push(node);
                if (lp[1] === KIXObjectType.TICKET) {
                    node.selected = true;
                    this.linkableObjectChanged([node]);
                }
            }
        }

        return nodes;
    }

    public async keyPressed(event: any): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        if (event.key === 'Enter' && formInstance.hasValues()) {
            this.executeSearch();
        }
    }

    public async linkableObjectChanged(nodes: TreeNode[]): Promise<void> {
        BrowserUtil.toggleLoadingShield('APP_SHIELD', true);

        this.selectedObjects = [];
        this.state.resultCount = 0;

        const context = ContextService.getInstance().getActiveContext();

        if (nodes && nodes.length) {
            const formId = nodes[0].id.toString();
            await context?.getFormManager()?.setFormId(formId);

            this.linkLabel = nodes[0].label;
            const formInstance = await context?.getFormManager()?.getFormInstance();
            if (formInstance) {
                context.setObjectList(formInstance.getObjectType(), []);
            }
        } else {
            this.state.table = null;
            this.state.resultCount = 0;
        }

        await this.setLinkTypes();
        this.setSubmitState();
        await this.prepareResultTable();
        BrowserUtil.toggleLoadingShield('APP_SHIELD', false);
    }

    private async executeSearch(): Promise<void> {
        BrowserUtil.toggleLoadingShield('APP_SHIELD', true);
        const context = ContextService.getInstance().getActiveContext<EditLinkedObjectsDialogContext>();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        if (context && formInstance.hasValues()) {
            const excludeObjects = this.rootObject && formInstance.getObjectType() === this.rootObject.KIXObjectType
                ? [this.rootObject]
                : null;

            const loadingOptions = await SearchService.getInstance().getLoadingOptions(
                formInstance, excludeObjects, null, true
            );

            context.setAdditionalInformation('LinkObjectSearchLoadingOptions', loadingOptions);
            await context.searchObjects(formInstance.getObjectType(), loadingOptions);

            await this.prepareResultTable();
            this.setSubmitState();
        }

        BrowserUtil.toggleLoadingShield('APP_SHIELD', false);
    }

    private async prepareResultTable(): Promise<void> {
        this.state.table = null;

        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();

        const objectType = formInstance.getObjectType();

        const tableConfiguration = new TableConfiguration(null, null, null,
            objectType, null, 10, null, [], true, false,
            null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await TableFactoryService.getInstance().createTable(
            `${IdService.generateDateBasedId()}-link-object-dialog-${objectType}`, objectType, tableConfiguration, null,
            EditLinkedObjectsDialogContext.CONTEXT_ID, true, null, true
        );
        await table.addAdditionalColumns([
            TableFactoryService.getInstance().getDefaultColumnConfiguration(objectType, 'LinkedAs')
        ]);

        this.tableSubscriber = {
            eventSubscriberId: 'link-object-dialog',
            eventPublished: (data: TableEventData, eventId: string): void => {
                if (data && data.tableId === table.getTableId()) {
                    if (eventId === TableEvent.REFRESH) {
                        this.state.resultCount = table?.getRowCount();
                    } else if (eventId === TableEvent.TABLE_READY) {
                        this.state.resultCount = table?.getRowCount();
                        this.setLinkedAsValues(table, this.state.linkDescriptions);
                        setTimeout(() => this.markNotSelectableRows(), 50);
                    }
                    this.selectedObjects = table.getSelectedRows().map((r) => r.getRowObject().getObject());
                    this.setSubmitState();
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.REFRESH, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);

        table.resetFilter();
        setTimeout(() => this.state.table = table, 50);
    }

    private setLinkedAsValues(table: Table, links: CreateLinkDescription[] = []): void {
        const values = links.map((ld) => {
            const name = ld.linkTypeDescription.asSource
                ? ld.linkTypeDescription.linkType.SourceName
                : ld.linkTypeDescription.linkType.TargetName;

            const value: [any, [string, any]] = [ld.linkableObject, ['LinkedAs', name]];
            return value;
        });
        if (values.length) {
            table.setRowObjectValues(values);
        }
    }

    private markNotSelectableRows(): void {
        const knownLinkedObjects = this.state.linkDescriptions.map((ld) => ld.linkableObject);
        if (this.state.table) {
            this.state.table.setRowObjectValueState(
                knownLinkedObjects.filter(
                    (ko) => !this.newLinks.some((nl) => nl.linkableObject.equals(ko))
                ),
                ValueState.HIGHLIGHT_UNAVAILABLE
            );
            this.state.table.setRowObjectValueState(
                this.newLinks.map((cld) => cld.linkableObject),
                ValueState.HIGHLIGHT_SUCCESS
            );
            this.state.table.setRowsSelectableByObject(knownLinkedObjects, false);
        }
    }

    private setSubmitState(): void {
        this.state.canSubmit = this.selectedObjects.length > 0 && this.state.currentLinkTypeDescription !== null;
    }

    public async submitClicked(): Promise<void> {
        if (this.state.canSubmit) {
            const newLinks = this.selectedObjects.map(
                (so) => new CreateLinkDescription(so, { ...this.state.currentLinkTypeDescription })
            );
            this.state.linkDescriptions = [...this.state.linkDescriptions, ...newLinks];
            this.newLinks = [...this.newLinks, ...newLinks];
            (this as any).emit('linksAdded', [this.state.linkDescriptions, newLinks]);

            const toast = await TranslationService.translate(
                'Translatable#{0} link(s) assigned.', [newLinks.length]
            );
            BrowserUtil.openSuccessOverlay(toast);
            this.setLinkedAsValues(this.state.table, newLinks);
            this.markNotSelectableRows();
            this.state.table.selectNone();
        }
    }

    private async setLinkTypes(): Promise<void> {
        this.linkTypeDescriptions = [];
        const linkTypeNodes = [];

        if (this.linkLabel) {
            const linkPartner = this.linkPartners.find(
                (lp) => lp[0] === this.linkLabel
            );

            const linkTypes = await LinkService.getLinkTypes(this.objectType, linkPartner[1]);

            for (const lt of linkTypes) {
                const id = this.linkTypeDescriptions.length;
                this.linkTypeDescriptions.push(new LinkTypeDescription(lt, true));
                const node = new TreeNode(id, await TranslationService.translate(lt.SourceName));
                linkTypeNodes.push(node);
                if (lt.Pointed === 1) {
                    const pointedLinkType = new LinkType(lt);
                    this.linkTypeDescriptions.push(new LinkTypeDescription(pointedLinkType, false));
                    const targetName = await TranslationService.translate(pointedLinkType.TargetName);
                    const pointedNode = new TreeNode(id + 1, targetName);
                    linkTypeNodes.push(pointedNode);
                }
            }
        } else {
            this.state.currentLinkTypeDescription = null;
        }

        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.linkTypeTreeId);
        if (treeHandler) {
            treeHandler.selectNone();
            treeHandler.setTree(linkTypeNodes);
        }
    }

    public linkTypeChanged(nodes: TreeNode[]): void {
        const node = nodes && nodes.length ? nodes[0] : null;
        this.state.currentLinkTypeDescription = node ? this.linkTypeDescriptions[node.id] : null;
        this.setSubmitState();
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }
}

module.exports = LinkDialogComponent;
