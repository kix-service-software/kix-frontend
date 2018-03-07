import { TicketProperty, TicketPropertyOperationMapper } from '@kix/core/dist/model';
import { SearchOperator } from "@kix/core/dist/browser/SearchOperator";
import { SearchAttributeState } from './SearchAttributeState';

export class TicketSearchAttributeComponent {

    private state: SearchAttributeState;

    public onCreate(input: any): void {
        this.state = new SearchAttributeState();
    }

    public onInput(input: any): void {
        this.state.attributeId = input.attributeId;
        this.state.attribute[0] = input.property;
        this.state.attribute[1] = input.operator;
        if (input.value && Array.isArray(input.value) && input.value.length) {
            this.state.attribute[3] = input.value[0];
        } else {
            this.state.attribute[3] = input.value;
        }
    }

    public async onMount(): Promise<void> {
        this.state.properties =
            Object.keys(TicketProperty)
                .filter((key) => TicketPropertyOperationMapper.getInstance().hasSearchOperations(TicketProperty[key]))
                .map((key) => [TicketProperty[key], TicketProperty[key]]) as Array<[string, string]>;

        this.state.properties = this.state.properties.sort((a, b) => a[1].localeCompare(b[1]));

        // if (this.state.attribute[0]) {
        //     const operations =
        //         TicketPropertyOperationMapper.getInstance().getPropertyOperations(this.state.attribute[0]);
        //     this.state.operations =
        //         operations.map((op) => [op, op]) as Array<[string, string]>;
        // }
    }

    private async propertyChanged(event: any): Promise<void> {
        const property = event.target.value;
        this.state.attribute[0] = property;

        // const operations = TicketPropertyOperationMapper.getInstance().getPropertyOperations(property);
        // this.state.operations =
        //     operations.map((op) => [op, op]) as Array<[string, string]>;

        this.attributeChanged();
    }

    private operatorChanged(event: any): void {
        this.state.attribute[1] = event.target.value;
        this.attributeChanged();
    }

    private valueChanged(value: string | number | string[] | number[]): void {
        this.state.attribute[2] = value;
        this.attributeChanged();
    }

    private attributeChanged(): void {
        (this as any).emit('attributeChanged', this.state.attributeId, this.state.attribute);
    }

}

module.exports = TicketSearchAttributeComponent;
