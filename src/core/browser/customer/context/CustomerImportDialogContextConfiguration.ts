import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { CustomerImportDialogContext } from './CustomerImportDialogContext';
import { ConfiguredWidget } from '../../../model';

export class CustomerImportDialogContextConfiguration extends ContextConfiguration {

    public constructor(
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
    ) {
        super(CustomerImportDialogContext.CONTEXT_ID, [], sidebars, sidebarWidgets, [], []);
    }

}
