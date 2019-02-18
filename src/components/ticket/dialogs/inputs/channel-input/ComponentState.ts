import { FormInputComponent, FormInputComponentState, Channel } from "../../../../../core/model";

export class ComponentState extends FormInputComponentState<number> {

    public constructor(
        public channels: Channel[] = null,
        public currentChannel: Channel = null,
        public channelNames: Array<[number, string]> = [],
        public noChannel: boolean = false
    ) {
        super();
    }

}
