import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    ObjectIcon, TicketProperty, Service, TreeNode, TreeUtil, FormInputComponent, FormContext
} from "@kix/core/dist/model";

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        this.state.nodes = this.prepareTree(objectData.servicesHierarchy);
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
        }
    }

    private prepareTree(services: Service[]): TreeNode[] {
        let nodes = [];
        if (services) {
            nodes = services.map((service: Service) => {
                return new TreeNode(
                    service.ServiceID, service.Name,
                    new ObjectIcon(TicketProperty.SERVICE_ID, service.ServiceID),
                    new ObjectIcon('CurInciStateID', service.IncidentState.CurInciStateID),
                    this.prepareTree(service.SubServices)
                );
            });
        }
        return nodes;
    }

    public serviceChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }

}

module.exports = Component;
