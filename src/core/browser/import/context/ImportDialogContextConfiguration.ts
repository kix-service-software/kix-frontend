import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { ImportDialogContext } from './ImportDialogContext';
import { ConfiguredWidget } from '../../../model';

export class ImportDialogContextConfiguration extends ContextConfiguration {

    public constructor(
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
    ) {
        super(ImportDialogContext.CONTEXT_ID, [], sidebars, sidebarWidgets, [], []);
    }

}
