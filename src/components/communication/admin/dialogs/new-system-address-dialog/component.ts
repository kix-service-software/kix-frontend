import { KIXObjectType, SystemAddressProperty, ContextMode } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { AbstractNewDialog } from "../../../../../core/browser/components/dialog";
import { RoutingConfiguration } from "../../../../../core/browser/router";
import { SystemAddressDetailsContext } from "../../../../../core/browser/system-address";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Address',
            'Translatable#Address successfully created.',
            KIXObjectType.SYSTEM_ADDRESS,
            new RoutingConfiguration(
                SystemAddressDetailsContext.CONTEXT_ID, KIXObjectType.SYSTEM_ADDRESS,
                ContextMode.DETAILS, SystemAddressProperty.ID, true
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
    }

}

module.exports = Component;
