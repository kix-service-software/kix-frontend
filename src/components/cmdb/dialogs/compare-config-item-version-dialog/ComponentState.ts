import { ConfiguredWidget } from "../../../../core/model";
import { AbstractComponentState } from "../../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public compareWidget: ConfiguredWidget = null,
        public title: string = null
    ) {
        super();
    }

}
