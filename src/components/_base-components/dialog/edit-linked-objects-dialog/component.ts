import { ComponentState } from './ComponentState';
import {
    DialogService, OverlayService, WidgetService,
    ContextService, StandardTableFactoryService, ITableHighlightLayer, TableHighlightLayer, LabelService
} from '@kix/core/dist/browser';
import {
    ComponentContent, OverlayType, StringContent,
    WidgetType, Link, KIXObject, LinkObject, KIXObjectType, CreateLinkDescription
} from '@kix/core/dist/model';

class Component {

    private state: ComponentState;
    private linkRootObject: KIXObject = null;
    private links: Link[] = [];
    private linkObjects: LinkObject[] = [];
    private highlightLayer: ITableHighlightLayer;
    private linkDescriptions: CreateLinkDescription[] = [];

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('link-objects-preview-table', WidgetType.GROUP);
        const activeContext = ContextService.getInstance().getActiveContext();
        if (activeContext) {
            this.linkRootObject = await activeContext.getObject();
            this.links = this.linkRootObject ? this.linkRootObject.Links : [];
            this.state.linkObjectCount = this.links ? this.links.length : 0;
            this.prepareLinkObjects();
            this.state.table = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.LINK_OBJECT
            );

            this.highlightLayer = new TableHighlightLayer();
            this.state.table.addAdditionalLayerOnTop(this.highlightLayer);

            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(this.linkObjects);
            this.state.table.loadRows(true);
            this.highlightLayer.setHighlightedObjects([]);
        }
    }

    private prepareLinkObjects() {
        const objectData = ContextService.getInstance().getObjectData();
        if (this.links && this.links.length && objectData) {
            this.linkObjects = this.links.map((l) => {
                const linkObject: LinkObject = new LinkObject();
                const linkedAs = objectData.linkTypes.find((lt) => lt.Name === l.Type);
                if (
                    l.SourceObject === this.linkRootObject.KIXObjectType &&
                    l.SourceKey.toString() === this.linkRootObject.ObjectId.toString()
                ) {
                    linkObject.ObjectId = l.TargetKey;
                    linkObject.linkedObjectKey = l.TargetKey;
                    linkObject.linkedObjectType = l.TargetObject as KIXObjectType;
                    linkObject.title = l.TargetKey + ':::' + l.TargetObject;
                    linkObject.linkedAs = linkedAs.TargetName;
                } else {
                    linkObject.ObjectId = l.SourceKey;
                    linkObject.linkedObjectKey = l.SourceKey;
                    linkObject.linkedObjectType = l.SourceObject as KIXObjectType;
                    linkObject.title = l.SourceKey + ':::' + l.SourceObject;
                    linkObject.linkedAs = linkedAs.SourceName;
                    linkObject.isSource = true;
                }
                return linkObject;
            });
        }
    }

    public getResultTitle(): string {
        return `Vorhandene Verknüpfungen (${this.state.linkObjectCount})`;
    }

    public openAddLinkDialog(): void {
        let dialogTitle = 'Objekt verknüpfen';
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.linkRootObject.KIXObjectType);
        if (labelProvider) {
            dialogTitle = `${labelProvider.getObjectName(false)} verknüpfen`;
        }
        const resultListenerId = 'result-listener-link-' + this.linkRootObject.KIXObjectType;
        DialogService.getInstance().openOverlayDialog(
            'link-object-dialog',
            {
                linkDescriptions: this.linkDescriptions,
                objectType: this.linkRootObject.KIXObjectType,
                resultListenerId
            },
            dialogTitle,
            'kix-icon-link'
        );
        DialogService.getInstance()
            .registerDialogResultListener<CreateLinkDescription[]>(
                resultListenerId, 'object-link', this.linksChanged.bind(this)
            );
    }

    private linksChanged(linkDescriptions: CreateLinkDescription[]): void {
        // TODO: anfügen, nicht ersetzen
        this.linkDescriptions = linkDescriptions;
        this.highlightNewLinks();
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true, "Verknüpfungen werden aktualisiert.");
        setTimeout(() => {
            this.showSuccessHint();
            DialogService.getInstance().closeMainDialog();
            DialogService.getInstance().setMainDialogLoading(false);
        }, 1500);
    }

    private showSuccessHint(): void {
        const content = new ComponentContent('list-with-title', {
            title: 'Verknüpfungen aktualisiert.',
            list: [],
            icon: 'kix-icon-check'
        });
        OverlayService.getInstance().openOverlay(OverlayType.TOAST, null, content, '');
    }

    private showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }

    public highlightNewLinks(): void {
        // this.highlightLayer.setHighlightedObjects(newLinks);
    }

}

module.exports = Component;
