import { TicketInputServiceComponentState } from "./TicketInputServiceComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, ObjectIcon, TicketProperty, Service, TreeNode } from "@kix/core/dist/model";

class TicketInputServiceComponent {

    private state: TicketInputServiceComponentState;

    public onCreate(): void {
        this.state = new TicketInputServiceComponentState();
    }

    public onInput(input): void {
        this.state.field = input.field;
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.nodes = this.prepareTree(objectData.servicesHierarchy);
    }

    private prepareTree(services: Service[]): TreeNode[] {
        let nodes = [];
        if (services) {
            nodes = services.map((service: Service) => {
                const incidentIcon = new ObjectIcon('CurInciStateID', service.IncidentState.CurInciStateID);

                const treeNode = new TreeNode(
                    service.ServiceID, service.Name,
                    new ObjectIcon(TicketProperty.SERVICE_ID, service.ServiceID),
                    incidentIcon,
                    this.prepareTree(service.SubServices)
                );
                return treeNode;
            });
        }
        return nodes;
    }

}

module.exports = TicketInputServiceComponent;
