export class RunActionRequest {

    public actionId: string;

    public input: any;

    public constructor(actionId: string, input: any) {
        this.actionId = actionId;
        this.input = input;
    }

}
