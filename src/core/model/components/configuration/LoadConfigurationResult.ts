export class LoadConfigurationResult<T> {

    public configuration: T;

    public constructor(configuration: T) {
        this.configuration = configuration;
    }
}
