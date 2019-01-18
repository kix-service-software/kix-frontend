import { CreateWatcher } from './CreateWatcher';

export class CreateWatcherRequest {

    public Watcher: CreateWatcher;

    public constructor(createWatcher: CreateWatcher) {
        this.Watcher = createWatcher;
    }

}
