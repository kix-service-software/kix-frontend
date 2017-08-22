const requiredMetadataKey = "required";
function required(target: object, propertyKey: string, parameterIndex: number): void {
    const existingRequiredParameters: number[]
        = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
    existingRequiredParameters.push(parameterIndex);
    Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}
export { required };
