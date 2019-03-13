import { ContextConfiguration } from '../../../model/components/context/ContextConfiguration';
import { ContactImportDialogContext } from './ContactImportDialogContext';
import { ConfiguredWidget } from '../../../model';

export class ContactImportDialogContextConfiguration extends ContextConfiguration {

    public constructor(
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
    ) {
        super(ContactImportDialogContext.CONTEXT_ID, [], sidebars, sidebarWidgets, [], []);
    }

}
