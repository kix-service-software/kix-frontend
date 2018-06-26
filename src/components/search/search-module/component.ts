import { ComponentState } from './ComponentState';
import { ContextService, KIXObjectSearchCache, KIXObjectSearchService } from "@kix/core/dist/browser";
import { ContextMode } from "@kix/core/dist/model";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();

    }

    public onMount(): void {
        ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
    }

    public openSearchDialog(): void {
        KIXObjectSearchService.getInstance().clearSearchCache();
        ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
    }


}

module.exports = Component;
