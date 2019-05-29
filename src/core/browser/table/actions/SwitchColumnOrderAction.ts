import { AbstractAction } from '../../../model';
import { ITable } from '../ITable';
import { Table } from '../Table';

export class SwitchColumnOrderAction extends AbstractAction<ITable> {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Switch';
        this.icon = 'kix-icon-exchange';
    }

    public canRun(): boolean {
        return this.data && this.data instanceof Table;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            this.data.switchColumnOrder();
        }
    }

}
