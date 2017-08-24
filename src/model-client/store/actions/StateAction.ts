export class StateAction<T> {

    public type: string;
    public payload: Promise<T>;

    public constructor(type: string, payload: Promise<T>) {
        this.type = type;
        this.payload = payload;
    }

}
