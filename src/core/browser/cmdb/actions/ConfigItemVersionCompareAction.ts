import { AbstractAction } from "../../../model";

export class ConfigItemVersionCompareAction extends AbstractAction {

    public initAction(): void {
        this.text = "Vergleichen";
        this.icon = "kix-icon-comparison-version";
    }

}
