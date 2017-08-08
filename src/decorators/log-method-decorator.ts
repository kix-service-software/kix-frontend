const logMethod = <T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) => {
    console.log("Method " + target.constructor.name + "." + propertyKey);
};

export default logMethod;
