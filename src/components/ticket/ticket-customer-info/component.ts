import { Organisation, KIXObjectType } from "../../../core/model";
import { KIXObjectService } from "../../../core/browser";
import { ComponentState } from './ComponentState';

class Component {

    private state: ComponentState;

    private organisationId: string = null;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.organisationId !== input.organisationId) {
            this.organisationId = input.organisationId;
            this.loadOrganisation();
        }
    }

    public onMount(): void {
        this.loadOrganisation();
    }

    private async loadOrganisation(): Promise<void> {
        this.state.error = null;
        this.state.organisation = null;

        if (this.organisationId) {
            const organisations = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, [this.organisationId]
            ).catch((error) => {
                this.state.error = error;
            });

            if (organisations && organisations.length) {
                this.state.organisation = organisations[0];
            }
        }
    }
}

module.exports = Component;
