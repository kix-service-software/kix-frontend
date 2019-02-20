import { ConfiguredWidget } from "../../../../core/model";

export class ComponentState {

    public constructor(
        public compareWidget: ConfiguredWidget = null,
        public title: string = null
    ) { }

}
