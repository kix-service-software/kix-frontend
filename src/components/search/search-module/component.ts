import { ContextService } from "@kix/core/dist/browser";
import { ContextMode } from "@kix/core/dist/model";

class Component {

    public onMount(): void {
        ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
    }

}

module.exports = Component;
