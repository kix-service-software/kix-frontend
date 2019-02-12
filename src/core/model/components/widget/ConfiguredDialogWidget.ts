import { ConfiguredWidget } from "./ConfiguredWidget";
import { WidgetConfiguration } from "./WidgetConfiguration";
import { KIXObjectType } from "../../kix";
import { ContextMode } from "../context";

export class ConfiguredDialogWidget<T = any> extends ConfiguredWidget<T> {

    public constructor(
        instanceId: string,
        configuration: WidgetConfiguration<T>,
        public kixObjectType: KIXObjectType,
        public contextMode: ContextMode
    ) {
        super(instanceId, configuration);
    }

}
