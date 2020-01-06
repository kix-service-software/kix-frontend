/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelService } from "./LabelService";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { ObjectIcon } from "../../../icon/model/ObjectIcon";

export class Label {

    public constructor(
        public object?: KIXObject,
        public id?: string | number,
        public icon?: string | ObjectIcon,
        public text?: string,
        public additionalText?: string,
        public tooltip?: string,
        public showUnknownIcon: boolean = false
    ) { }
    public async init(): Promise<void> {
        if (this.object) {
            this.icon = LabelService.getInstance().getObjectIcon(this.object) || this.icon;
            this.text = await LabelService.getInstance().getText(this.object) || this.text;
            this.additionalText = LabelService.getInstance().getAdditionalText(this.object) || this.additionalText;
            this.tooltip = this.text + ': ' + LabelService.getInstance().getTooltip(this.object) || this.text;
        }
    }

}
