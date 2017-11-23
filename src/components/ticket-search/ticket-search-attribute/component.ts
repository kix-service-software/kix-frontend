import { TranslationHandler } from "@kix/core/dist/browser/TranslationHandler";
import { TicketProperty } from '@kix/core/dist/model';
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
        this.state.attribute[3] = input.value;
    }

    public async onMount(): Promise<void> {
        const th = await TranslationHandler.getInstance();
        this.state.properties = Object.keys(TicketProperty).map(
            (key) => [TicketProperty[key], th.getTranslation(key)]
        ) as Array<[string, string]>;

        this.state.operations = Object.keys(SearchOperator).map(
            (op) => [SearchOperator[op], th.getTranslation(op)]
        ) as Array<[string, string]>;
    }

    private propertyChanged(event: any): void {
        this.state.attribute[0] = event.target.value;
        this.attributeChanged();
    }

    private operatorChanged(event: any): void {
        this.state.attribute[1] = event.target.value;
        this.attributeChanged();
    }

    private valueChanged(event: any): void {
        // TODO: handle multiple values
        const value = event.target.value;
        this.state.attribute[2] = value === '' ? [] : [value];
        this.state.invalid = value === '';
        this.attributeChanged();
    }

    private attributeChanged(): void {
        (this as any).emit('attributeChanged', this.state.attributeId, this.state.attribute);
    }

}

module.exports = TicketSearchAttributeComponent;
