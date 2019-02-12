import { ConfiguredWidget } from "../../../../../model";
import { ContextConfiguration } from '../../../../../model/components/context/ContextConfiguration';

export class NewTicketPriorityDialogContextConfiguration extends ContextConfiguration {

    public constructor(
        public contextId: string,
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
    ) {
        super(contextId, sidebars, [], sidebarWidgets, [], []);
    }

}
