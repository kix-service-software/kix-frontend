import { IMarkoComponent } from "./IMarkoComponent";

export abstract class AbstractMarkoComponent<CS = any, I = any> implements IMarkoComponent<CS, I> {

    public state: CS;

    public onCreate(input: I): void {
        return;
    }

    public onInput(input: I): void {
        return;
    }

    public async onMount(): Promise<void> {
        return;
    }

    public onUpdate(): void {
        return;
    }

    public onDestroy(): void {
        return;
    }

}
