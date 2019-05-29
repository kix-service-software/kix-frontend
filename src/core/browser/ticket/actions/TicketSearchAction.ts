import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode } from '../../../model';

export class TicketSearchAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Search';
        this.icon = 'kix-icon-search';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(null, KIXObjectType.TICKET, ContextMode.SEARCH, null, true);
    }

}
