import { ContextConfiguration, ConfiguredWidget } from "../../../../../model";

export class NewUserDialogContextConfiguration extends ContextConfiguration {

    public constructor(
        public contextId: string,
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
    ) {
        super(contextId, sidebars, [], sidebarWidgets, [], []);
    }

}
