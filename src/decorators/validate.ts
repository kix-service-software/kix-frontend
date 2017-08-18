import 'reflect-metadata';
import { RequiredError } from "../model";
const requiredMetadataKey = "required";
function validate(target: any, propertyName: string, descriptor: any) {
    const method = descriptor.value;
    descriptor.value = (...args: any[]) => {
        const requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
        if (requiredParameters) {
            for (const parameterIndex of requiredParameters) {
                if (parameterIndex >= args.length
                    || args[parameterIndex] === undefined
                    || args[parameterIndex] === null) {

                    throw new RequiredError("Missing required argument.");
                }
            }
        }
        const bla = this;
        const result = method.apply(target, args);
        return result;
    };
    return descriptor;
}
export { validate };
