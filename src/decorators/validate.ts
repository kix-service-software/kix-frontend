import 'reflect-metadata';
import { RequiredError } from "../model";

function validate(target: any, propertyName: string, descriptor: any): MethodDecorator {
    const requiredMetadataKey = "required";
    const method = descriptor.value;
    descriptor.value = function () {
        const requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
        if (requiredParameters) {
            for (const parameterIndex of requiredParameters) {
                if (parameterIndex >= arguments.length
                    || arguments[parameterIndex] === undefined
                    || arguments[parameterIndex] === null) {

                    throw new RequiredError("Missing required argument.");
                }
            }
        }
        const result = method.apply(this, arguments);
        return result;
    };
    return descriptor;
}
export { validate };
