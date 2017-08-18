const requiredMetadataKey = "required";
function validate(target: any, propertyName: string, descriptor: any) {
    // descriptor = Object.getOwnPropertyDescriptor(target, propertyName);
    const method = descriptor.value;
    descriptor.value = (...args: any[]) => {
        const requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
        if (requiredParameters) {
            for (const parameterIndex of requiredParameters) {
                if (parameterIndex >= args.length
                    || args[parameterIndex] === undefined
                    || args[parameterIndex] === null) {
                    throw new Error("Missing required argument.");
                }
            }
        }

        const result = method.apply(target, args);
        return result;
    };
    return descriptor;
}
export { validate };
