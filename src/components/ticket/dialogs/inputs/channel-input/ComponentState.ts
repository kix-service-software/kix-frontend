import { FormInputComponentState, Channel } from "../../../../../core/model";

export class ComponentState extends FormInputComponentState<number> {

    public constructor(
        public channels: Channel[] = [],
        public currentChannel: Channel = null,
        public channelNames: Array<[number, string]> = [],
        public noChannel: boolean = false
    ) {
        super();
    }

}
