import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ConfiguredWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';
import { TicketContextConfiguration, TicketContext } from '@kix/core/dist/browser/ticket';

export class TicketModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return TicketContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): any {
        const queueExplorer =
            new ConfiguredWidget('20180813-ticket-queue-explorer', new WidgetConfiguration(
                'ticket-queue-explorer', 'Queues', [], {},
                false, false, WidgetSize.SMALL, null
            ));

        const explorer = ['20180813-ticket-queue-explorer'];
        const explorerWidgets: Array<ConfiguredWidget<any>> = [queueExplorer];

        return new TicketContextConfiguration(this.getModuleId(), explorer, [], [], explorerWidgets, []);
    }

    public async createFormDefinitions(): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
