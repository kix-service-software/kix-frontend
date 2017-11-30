import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class TicketsMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "modules/tickets",
            "dialogs/ticket-creation",
            "dialogs/ticket-creation/inputs/ticket-attachment-input",
            "dialogs/ticket-creation/inputs/ticket-customer-id-input",
            "dialogs/ticket-creation/inputs/ticket-customer-input",
            "dialogs/ticket-creation/inputs/ticket-description-input",
            "dialogs/ticket-creation/inputs/ticket-dynamic-field-input",
            "dialogs/ticket-creation/inputs/ticket-pending-time-input",
            "dialogs/ticket-creation/inputs/ticket-priority-input",
            "dialogs/ticket-creation/inputs/ticket-queue-input",
            "dialogs/ticket-creation/inputs/ticket-state-input",
            "dialogs/ticket-creation/inputs/ticket-service-input",
            "dialogs/ticket-creation/inputs/ticket-sla-input",
            "dialogs/ticket-creation/inputs/ticket-subject-input",
            "dialogs/ticket-creation/inputs/ticket-templates-input",
            "dialogs/ticket-creation/inputs/ticket-type-input",
            "dialogs/ticket-creation/inputs/ticket-user-input",
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['tickets', 'modules/tickets'],
            ['ticket-table', 'base-components/ticket-table']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new TicketsMarkoDependencyExtension();
};
