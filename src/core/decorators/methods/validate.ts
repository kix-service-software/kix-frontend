import 'reflect-metadata';
import { RequiredError } from "..";

const requiredMetadataKey = "required";
function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>): any {
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
        return method.apply(this, arguments);
    };
    return descriptor;
}
export { validate };
