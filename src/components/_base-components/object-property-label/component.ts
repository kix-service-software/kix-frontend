import { Ticket } from "@kix/core/dist/model";
import { ObjectPropertyLabelComponentState } from './ObjectPropertyLabelComponentState';

export class ObjectPropertyLabelComponent {

    private state: any;

    public onCreate(): void {
        this.state = new ObjectPropertyLabelComponentState();
    }

    public onInput(input: any): void {
        this.state.object = input.object;
        this.state.property = input.property;
        this.state.hasLabel = typeof input.hasLabel !== 'undefined' ? input.hasLabel : true;
        this.state.hasText = typeof input.hasText !== 'undefined' ? input.hasText : true;
        this.state.hasIcon = typeof input.hasIcon !== 'undefined' ? input.hasIcon : true;
    }

    // TODO: "Objekte" als Extension ermöglichen
    private isTicket(): boolean {
        return this.state.object instanceof Ticket;
    }

    private getValue(): string {
        let value = '';
        if (this.state.property) {
            value = typeof this.state.object[this.state.property] !== 'undefined' ?
                this.state.object[this.state.property] : this.state.property;
        }
        return value.toString();
    }

}

module.exports = ObjectPropertyLabelComponent;
