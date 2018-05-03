import { TicketInputServiceComponentState } from "./TicketInputServiceComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, Service, TreeNode, FormInputComponentState, FormFieldValue
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputServiceComponent {

    private state: TicketInputServiceComponentState;

    public onCreate(): void {
        this.state = new TicketInputServiceComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
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

    private itemChanged(item: FormDropdownItem): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue(this.state.field, new FormFieldValue<number>(Number(item.id)));
    }

}

module.exports = TicketInputServiceComponent;
