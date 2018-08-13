import { ComponentState } from './ComponentState';
import {
    ContextService, ActionFactory, KIXObjectServiceRegistry, StandardTableFactoryService,
    TableConfiguration, TableHeaderHeight, TableRowHeight,
    ObjectLinkDescriptionLabelLayer, TableColumn, WidgetService, IdService
} from '@kix/core/dist/browser';
import { KIXObjectType, Link, KIXObject, DataType, WidgetType } from '@kix/core/dist/model';
import { FAQArticle } from '@kix/core/dist/model/kix/faq';
import { IContextListener } from '@kix/core/dist/browser/context/IContextListener';

class Component {

    private state: ComponentState;
    private contextListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('faq-linked-objects-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('linked-object-group', WidgetType.GROUP);
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        this.state.faqArticle = await context.getObject<FAQArticle>();
        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, object: FAQArticle) => {
                if (id.toString() === this.state.faqArticle.ObjectId.toString()) {
                    this.state.faqArticle = object;
                    this.setLinkedObjects();
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; }
        });

        if (this.state.faqArticle) {
            this.setActions();
            await this.setLinkedObjectsGroups();
        }

        this.state.loading = false;

    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.faqArticle) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.faqArticle]
            );
        }
    }

    private async setLinkedObjectsGroups(): Promise<void> {
        if (this.state.widgetConfiguration.settings) {
            const linkedObjectTypes: Array<[string, KIXObjectType]> =
                this.state.widgetConfiguration.settings.linkedObjectTypes;

            const faqArticleId = this.state.faqArticle.ID.toString();

            let objectsCount = 0;
            for (const lot of linkedObjectTypes) {
                const objectLinks = this.state.faqArticle.Links.filter((link) => this.checkLink(link, lot[1]));
                const objectIds = objectLinks.map((ol) => ol.SourceKey === faqArticleId ? ol.TargetKey : ol.SourceKey);

                const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(lot[1]);
                const objects = objectIds.length ? await service.loadObjects(lot[1], objectIds, null) : [];

                const tableConfiguration = new TableConfiguration(
                    null, 5, null, null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                );

                const table = StandardTableFactoryService.getInstance().createStandardTable<KIXObject>(
                    lot[1], tableConfiguration, null, null, true
                );

                table.addAdditionalLayerOnTop(new ObjectLinkDescriptionLabelLayer());

                table.layerConfiguration.contentLayer.setPreloadedObjects(objects);
                table.loadRows();

                table.setColumns([
                    new TableColumn('LinkedAs', DataType.STRING, '', null, true, true, 100, true, false, null)
                ]);

                objectsCount += objects.length;
                const title = `${lot[0]} (${objects.length})`;
                this.state.linkedObjectGroups.push([title, table]);
            }

            this.state.widgetTitle = `${this.state.widgetConfiguration.title} (${objectsCount})`;
        }

    }

    private checkLink(link: Link, objectType: KIXObjectType): boolean {
        const faqArticleId = this.state.faqArticle.ID.toString();
        return (link.SourceObject === objectType && link.SourceKey !== faqArticleId) ||
            (link.TargetObject === objectType && link.TargetKey !== faqArticleId);
    }

    public async setLinkedObjects(): Promise<void> {
        this.state.loading = true;
        this.state.linkedObjectGroups = [];
        await this.setLinkedObjectsGroups();
        (this as any).setStateDirty('linkedObjectGroups');
        this.state.loading = false;
    }

}

module.exports = Component;
