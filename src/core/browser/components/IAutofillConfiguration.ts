export interface IAutofillConfiguration {

    textTestCallback(range): any;

    dataCallback(matchInfo, callback): void;

    itemTemplate: string;

    outputTemplate: string;

}
