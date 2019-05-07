export class RequestObject {

    public constructor(parameter?: Array<[string, any]>) {
        if (parameter) {
            parameter.forEach((p) => this.applyProperty(p[0], p[1]));
        }
    }

    protected applyProperty(name: string, value: any): void {
        if (value !== undefined) {
            this[name] = value;
        }
    }

}
