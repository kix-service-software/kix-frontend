import { ConfiguredWidget } from "../../../model";
import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';

export class SearchContextConfiguration extends ContextConfiguration {

    public constructor(
        public contextId: string,
        public explorer: string[],
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
        public explorerWidgets: ConfiguredWidget[],
        public content: string[],
        public contentWidgets: ConfiguredWidget[],
        public overlayWidgets: ConfiguredWidget[]
    ) {
        super(contextId, sidebars, explorer, sidebarWidgets, explorerWidgets, overlayWidgets);
    }
}
