/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    WidgetService, TableConfiguration, TableRowHeight,
    TableHeaderHeight, KIXObjectService, SearchOperator, BrowserUtil,
    TableFactoryService, ContextService, TableEvent, DefaultColumnConfiguration, ValueState,
    TableEventData, LabelService, ITable
} from '../../../../core/browser';
import { FormService } from '../../../../core/browser/form';
import {
    FormContext, KIXObject, KIXObjectType, WidgetType, CreateLinkDescription, LinkTypeDescription,
    TreeNode, LinkType, KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType, DataType,
    TreeService
} from '../../../../core/model';
import { ComponentState } from './ComponentState';
import { LinkUtil, LinkObjectDialogContext } from '../../../../core/browser/link';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { DialogService } from '../../../../core/browser/components/dialog';
import { SearchService } from '../../../../core/browser/kix/search/SearchService';

class LinkDialogComponent {

    private state: ComponentState;
    private linkTypeDescriptions: LinkTypeDescription[] = [];
    private newLinks: CreateLinkDescription[] = [];
    private resultListenerId: string;
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
        this.state.linkDescriptions = !this.state.linkDescriptions
            ? input.linkDescriptions || []
            : this.state.linkDescriptions;
        this.newLinks = [];
        this.objectType = input.objectType;
        this.resultListenerId = input.resultListenerId;
        this.rootObject = input.rootObject;
    }

    public async onMount(): Promise<void> {
        this.selectedObjects = [];

        this.state.translations = await TranslationService.createTranslationObject(
            ["Translatable#Link to", "Translatable#Search"]
        );

        WidgetService.getInstance().setWidgetType('link-object-dialog-form-widget', WidgetType.GROUP);

        this.setLinkTypes();

        this.setSubmitState();
        this.state.loading = false;
    }

    public async onDestroy(): Promise<void> {
        this.state.linkDescriptions = null;
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        FormService.getInstance().deleteFormInstance(this.state.formId);
        TableFactoryService.getInstance().destroyTable(`link-object-dialog-`, true);
    }

    private async loadNodes(): Promise<TreeNode[]> {
        this.linkPartners = await LinkUtil.getPossibleLinkPartners(this.objectType);

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
        if (this.state.formId) {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            if (event.key === 'Enter' && formInstance.hasValues()) {
                this.executeSearch();
            }
        }
    }

    public async linkableObjectChanged(nodes: TreeNode[]): Promise<void> {
        DialogService.getInstance().setOverlayDialogLoading(true);

        this.selectedObjects = [];
        this.state.resultCount = 0;

        this.state.formId = null;

        const context = await ContextService.getInstance().getContext<LinkObjectDialogContext>(
            LinkObjectDialogContext.CONTEXT_ID
        );

        let formId: string;
        if (nodes && nodes.length) {
            formId = nodes[0].id.toString();
            this.linkLabel = nodes[0].label;
            const formInstance = await FormService.getInstance().getFormInstance(formId, false);
            context.setObjectList(this.objectType, []);
            formInstance.reset();
        } else {
            this.state.table = null;
            formId = null;
            this.state.resultCount = 0;
        }

        await this.setLinkTypes();

        (this as any).setStateDirty('currentLinkableObjectNode');

        setTimeout(async () => {
            this.setSubmitState();
            this.state.formId = formId;
            await this.prepareResultTable();
            DialogService.getInstance().setOverlayDialogLoading(false);
        }, 50);
    }

    private async executeSearch(): Promise<void> {
        DialogService.getInstance().setOverlayDialogLoading(true);
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (this.state.formId && formInstance.hasValues()) {
            const excludeObjects = this.rootObject && formInstance.getObjectType() === this.rootObject.KIXObjectType
                ? [this.rootObject]
                : null;

            const objects = await SearchService.getInstance().executeSearch(
                this.state.formId, excludeObjects
            );

            const context = await ContextService.getInstance().getContext<LinkObjectDialogContext>(
                LinkObjectDialogContext.CONTEXT_ID
            );

            context.setObjectList(formInstance.getObjectType(), objects);
            await this.prepareResultTable();
            this.state.resultCount = objects.length;
            this.setSubmitState();
        }

        DialogService.getInstance().setOverlayDialogLoading(false);
    }

    private async prepareResultTable(): Promise<void> {
        this.state.table = null;

        if (this.state.formId) {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);

            const objectType = formInstance.getObjectType();

            const tableConfiguration = new TableConfiguration(null, null, null,
                objectType, null, 5, null, [], true, false,
                null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
            const table = await TableFactoryService.getInstance().createTable(
                `link-object-dialog-${objectType}`, objectType, tableConfiguration, null,
                LinkObjectDialogContext.CONTEXT_ID, true, null, true
            );
            table.addColumns([
                TableFactoryService.getInstance().getDefaultColumnConfiguration(objectType, 'LinkedAs')
            ]);

            this.tableSubscriber = {
                eventSubscriberId: 'link-object-dialog',
                eventPublished: (data: TableEventData, eventId: string) => {
                    if (data && data.tableId === table.getTableId()) {
                        if (eventId === TableEvent.TABLE_READY) {
                            this.setLinkedAsValues(table, this.state.linkDescriptions);
                            this.markNotSelectableRows();
                        }
                        this.selectedObjects = table.getSelectedRows().map((r) => r.getRowObject().getObject());
                        this.setSubmitState();
                    }
                }
            };

            EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
            EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);

            setTimeout(() => this.state.table = table, 50);
        }
    }

    private setLinkedAsValues(table: ITable, links: CreateLinkDescription[] = []) {
        const values = links.map((ld) => {
            const name = ld.linkTypeDescription.asSource
                ? ld.linkTypeDescription.linkType.SourceName
                : ld.linkTypeDescription.linkType.TargetName;

            const value: [any, [string, any]] = [ld.linkableObject, ['LinkedAs', name]];
            return value;
        });
        if (!!values.length) {
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
            // FIXME: obsolet, DialogEvnets.DIALOG_CANCELED bzw. .DIALOG_FINISHED verwenden
            DialogService.getInstance().publishDialogResult(
                this.resultListenerId,
                [this.state.linkDescriptions, newLinks]
            );

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
            const loadingOptions = new KIXObjectLoadingOptions([
                new FilterCriteria(
                    'Source', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, this.objectType
                ),
                new FilterCriteria(
                    'Target', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, linkPartner[1]
                )
            ]);

            const linkTypes = await KIXObjectService.loadObjects<LinkType>(
                KIXObjectType.LINK_TYPE, null, loadingOptions, null, false
            );

            linkTypes.forEach(async (lt) => {
                const id = this.linkTypeDescriptions.length;
                this.linkTypeDescriptions.push(new LinkTypeDescription(lt, true));
                const node = new TreeNode(id, await TranslationService.translate(lt.SourceName));
                linkTypeNodes.push(node);
                if (lt.Pointed === 1) {
                    const pointedLinkType = new LinkType(lt);
                    this.linkTypeDescriptions.push(new LinkTypeDescription(pointedLinkType, false));
                    const pointedNode = new TreeNode(id + 1,
                        await TranslationService.translate(pointedLinkType.TargetName));
                    linkTypeNodes.push(pointedNode);
                }
            });
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
