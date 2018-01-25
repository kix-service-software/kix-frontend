import { WidgetComponentState } from "@kix/core/dist/browser/model/widget/WidgetComponentState";

export class BaseWidgetComponentState extends WidgetComponentState {


    public constructor(public configChanged: boolean = false) {
        super();
    }

}
