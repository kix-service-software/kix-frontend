import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';

export class TicketTableComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            tickets: [],
            properties: []
        };
    }

    public async onInput(input: any): Promise<void> {
        const th = await TranslationHandler.getInstance();

        this.state.properties = input.properties.map((sp) => [sp, th.getTranslation(sp)]);
        this.state.tickets = input.tickets;
    }
}

module.exports = TicketTableComponent;
