export abstract class RequestObject {

    protected applyProperty(name: string, value: any): void {
        if (value !== undefined) {
            this[name] = value;
        }
    }

}
