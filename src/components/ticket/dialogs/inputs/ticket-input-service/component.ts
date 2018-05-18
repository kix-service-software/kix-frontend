import { TicketInputServiceComponentState } from "./TicketInputServiceComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, Service, TreeNode,
    FormInputComponentState, FormFieldValue, TreeUtil, FormInputComponent
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputServiceComponent extends FormInputComponent<number, TicketInputServiceComponentState> {

    public onCreate(): void {
        this.state = new TicketInputServiceComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        const objectData = ContextService.getInstance().getObjectData();
        this.state.nodes = this.prepareTree(objectData.servicesHierarchy);
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue<number>(this.state.field.property);
            if (value) {
                this.state.currentNode = TreeUtil.findNode(this.state.nodes, value.value);
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
        super.provideValue(node ? node.id : null);
    }

}

module.exports = TicketInputServiceComponent;
