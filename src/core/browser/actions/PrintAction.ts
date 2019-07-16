import { AbstractAction } from "../../model";

export class PrintAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Print';
        this.icon = "kix-icon-print";
    }

    public async run(event: any): Promise<void> {
        if (window) {
            window.print();
        }
    }

}
