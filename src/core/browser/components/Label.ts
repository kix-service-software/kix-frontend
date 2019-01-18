import { ObjectIcon, KIXObject } from "../../model";
import { LabelService } from "../LabelService";

export class Label {

    public constructor(
        public object?: KIXObject,
        public id?: string | number,
        public icon?: string | ObjectIcon,
        public text?: string,
        public additionalText?: string,
        public tooltip?: string,
        public showUnknownIcon: boolean = false
    ) {
        this.init(object);
    }

    private async init(object: KIXObject): Promise<void> {
        if (object) {
            this.icon = LabelService.getInstance().getIcon(object) || this.icon;
            this.text = await LabelService.getInstance().getText(object) || this.text;
            this.additionalText = LabelService.getInstance().getAdditionalText(object) || this.additionalText;
            this.tooltip = LabelService.getInstance().getTooltip(object) || this.tooltip;
        }
    }

}
