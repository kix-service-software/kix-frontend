export class ComponentState {

    public constructor(
        public cancelCallback: () => void = null,
        public cancel: boolean = false,
        public time: number = null
    ) { }

}
