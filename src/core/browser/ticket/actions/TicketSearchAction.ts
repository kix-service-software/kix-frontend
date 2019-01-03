import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode } from '../../../model';

export class TicketSearchAction extends AbstractAction {

    public initAction(): void {
        this.text = "Suche";
        this.icon = "kix-icon-search";
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(null, KIXObjectType.TICKET, ContextMode.SEARCH);
    }

}
