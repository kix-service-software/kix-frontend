import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { CompareConfigItemVersionDialogContext } from './CompareConfigItemVersionDialogContext';
import { ConfiguredWidget, WidgetConfiguration } from '../../../model';

export class CompareConfigItemVersionDialogContextConfiguration extends ContextConfiguration {

    public constructor(
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
        public compareWidget: ConfiguredWidget
    ) {
        super(CompareConfigItemVersionDialogContext.CONTEXT_ID, [], sidebars, sidebarWidgets, [], []);
    }

}
