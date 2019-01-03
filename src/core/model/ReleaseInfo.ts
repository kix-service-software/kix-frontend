import { SystemInfo } from "./SystemInfo";

export class ReleaseInfo {

    public constructor(
        public product?: string,
        public version?: string,
        public buildDate?: string,
        public buildHost?: string,
        public buildNumber?: number,
        public backendSystemInfo?: SystemInfo
    ) { }

}
