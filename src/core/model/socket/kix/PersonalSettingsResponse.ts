import { ISocketResponse } from "../ISocketResponse";
import { PersonalSetting } from "../../kix";

export class PersonalSettingsResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public personalSettings: PersonalSetting[]
    ) { }

}
