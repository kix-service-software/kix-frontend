import { ComponentState } from './ComponentState';
import {
    DialogService, OverlayService,
    ContextService, StandardTableFactoryService, ITableHighlightLayer,
    TableHighlightLayer, LabelService, ServiceRegistry, SearchOperator,
    ITablePreventSelectionLayer, TablePreventSelectionLayer, IKIXObjectService, KIXObjectService, BrowserUtil
} from '../../../../core/browser';
import {
    ComponentContent, OverlayType, StringContent,
    KIXObject, LinkObject, KIXObjectType,
    CreateLinkDescription, KIXObjectPropertyFilter, TableFilterCriteria,
    LinkObjectProperty, LinkTypeDescription, CreateLinkObjectOptions,
    ToastContent, LinkType, ContextType, SortUtil, DataType, KIXObjectCache
} from '../../../../core/model';
import { LinkUtil } from '../../../../core/browser/link';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
    }

    public async onMount(): Promise<void> {
        this.state.loading = false;
        // TODO: wieder entfernen
        this.state.canSubmit = true;
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public setCanSubmit(): void {
        // TODO: korrekte Prüfung implementieren
        this.state.canSubmit = true;
    }

    public async submit(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(false);
        if (true) {
            // BrowserUtil.openSuccessOverlay('Verknüpfungen aktualisiert.');
            DialogService.getInstance().closeMainDialog();
        }
    }
}

module.exports = Component;
