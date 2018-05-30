import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser";
import { KIXObjectType, KIXObject, Customer } from "@kix/core/dist/model";

class Component {
    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;

        const context = ContextService.getInstance().getContext();
        context.registerListener({
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectChanged: (objectId: string | number, object: Customer, type: KIXObjectType) => {
                if (type === KIXObjectType.CUSTOMER) {
                    this.state.customer = object;
                }
            }
        });

        this.state.customer = (context.getObject(context.objectId) as Customer);
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

}

module.exports = Component;
