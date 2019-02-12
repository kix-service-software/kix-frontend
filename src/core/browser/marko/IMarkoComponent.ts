export interface IMarkoComponent<CS extends any, I extends any> {

    state: CS;

    onCreate(input: I): void;

    onInput(input: I): void;

    onMount(): Promise<void>;

    onUpdate(): void;

    onDestroy(): void;

}
