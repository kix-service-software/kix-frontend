A UI component is the implementation of a web component which is rendered and displayed in the browser. The components are based on the [marko-js]()https://markojs.com) framework.

### Basic Component Structure

Its recommended to use a multi file component implementation which means that you have to separate your code into 4 files:

* index.marko (view html (marko) template)
* component.ts (view model)
* ComponentState.ts (the state class for the component)
* style.less (component specific styling)

![component structure](static/component-structure.png)

For detailed information see: https://markojs.com/docs/class-components/#multi-file-components

### Behavior and Lifecycle

If the state of the component is manipulated or the component receives new input the template will automatically update in the browser.

* First the component is created the method `onCreate()` is called by marko. In this method you have to instantiate the `ComponentState`. 
* After the component is created the next step is to mount the component in the DOM. In this case the method `onMount()` is called. In this method you can implement the initial status of the component. 
* If the component recieves new input from parent then the method `onInput(input: any)` is called. 
* At the end of the lifecycle the method `onDestroy()` is called. In this implementation you can cleanup all the things depending to your component.

For more information see: https://markojs.com/docs/class-components/#lifecycle-events

### Example `timer`:

index.marko
```html
<span>
    <translation-string pattern="Translatable#expected time required:"/>
    ${state.timeText}
</span>
```

component.ts
```typescript
class Component extends AbstractMarkoComponent<ComponentState> {

    private interval: any;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.time = input.time;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        if (this.state.time) {
            this.interval = setInterval(() => {
                this.state.time = this.state.time - 1000;
                if (this.state.time <= 0) {
                    this.state.time = 0;
                }
                this.state.timeText = DateTimeUtil.getTimeByMillisec(this.state.time);

            }, 1000);
        }
    }

    public async onDestroy(): Promise<void> {
        clearInterval(this.interval);
    }
}

module.exports = Component;
```

ComponentState.ts
```typescript
export class ComponentState {

    public constructor(
        public time: number = null,
        public timeText: string = null
    ) { }

}
```
