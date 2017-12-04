export class BaseTemplateComponentState {

    public constructor(
        public contextId: string,
        public objectId: string,
        public tagLib: any,
        public configurationMode: boolean = false,
        public showOverlay: boolean = false,
        public showDialog: boolean = false,
        public dialogContent: any = null,
    ) { }

}
