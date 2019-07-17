import { NotificationFilterManager } from "./NotificationFilterManager";
import { FormInputComponentState } from "../../../../../../core/model";

export class ComponentState extends FormInputComponentState<Array<[string, string[] | number[]]>> {

    public constructor(
        public manager: NotificationFilterManager = new NotificationFilterManager()
    ) {
        super();
    }

}
