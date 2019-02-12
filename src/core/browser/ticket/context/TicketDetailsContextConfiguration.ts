import { ConfiguredWidget } from "../../../model";
import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';

export class TicketDetailsContextConfiguration extends ContextConfiguration {

    public constructor(
        public contextId: string,
        public explorer: string[],
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
        public explorerWidgets: ConfiguredWidget[],
        public lanes: string[],
        public laneTabs: string[],
        public laneWidgets: ConfiguredWidget[],
        public laneTabWidgets: ConfiguredWidget[],
        public generalActions: string[] = [],
        public ticketActions: string[] = [],
        public overlayWidgets: ConfiguredWidget[],
        public content: string[],
        public contentWidgets: ConfiguredWidget[]
    ) {
        super(contextId, sidebars, explorer, sidebarWidgets, explorerWidgets, overlayWidgets);
    }

}
