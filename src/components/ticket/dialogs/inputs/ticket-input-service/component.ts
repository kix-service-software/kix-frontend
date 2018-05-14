import { TicketInputServiceComponentState } from "./TicketInputServiceComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, Service, TreeNode, FormInputComponentState, FormFieldValue, TreeUtil
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
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.registerListener(this.formUpdated.bind(this));
    }

    public formUpdated(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue<number>(this.state.field.property);
            if (value) {
                this.state.currentNode = TreeUtil.findNode(this.state.nodes, value.value);
                this.state.invalid = !value.valid;
            }
        }
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

    private itemChanged(node: TreeNode): void {
        this.state.currentNode = node;
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue<number>(
            this.state.field.property, (node ? node.id : null)
        );
        const fieldValue = formInstance.getFormFieldValue(this.state.field.property);
        this.state.invalid = !fieldValue.valid;
    }

}

module.exports = TicketInputServiceComponent;
