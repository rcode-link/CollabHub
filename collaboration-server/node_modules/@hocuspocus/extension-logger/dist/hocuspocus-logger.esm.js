class Logger {
    /**
     * Constructor
     */
    constructor(configuration) {
        this.name = null;
        this.configuration = {
            prefix: null,
            onLoadDocument: true,
            onChange: true,
            onStoreDocument: true,
            onConnect: true,
            onDisconnect: true,
            onUpgrade: true,
            onRequest: true,
            onDestroy: true,
            onConfigure: true,
            log: console.log, // eslint-disable-line
        };
        this.configuration = {
            ...this.configuration,
            ...configuration,
        };
    }
    async onConfigure(data) {
        this.name = data.instance.configuration.name;
        if (!this.configuration.onConfigure) {
            return;
        }
        if (this.configuration.prefix) {
            console.warn('[hocuspocus warn] The Logger \'prefix\' is deprecated. Pass a \'name\' to the Hocuspocus configuration instead.');
        }
    }
    async onLoadDocument(data) {
        if (this.configuration.onLoadDocument) {
            this.log(`Loaded document "${data.documentName}".`);
        }
    }
    async onChange(data) {
        if (this.configuration.onChange) {
            this.log(`Document "${data.documentName}" changed.`);
        }
    }
    async onStoreDocument(data) {
        if (this.configuration.onStoreDocument) {
            this.log(`Store "${data.documentName}".`);
        }
    }
    async onConnect(data) {
        if (this.configuration.onConnect) {
            this.log(`New connection to "${data.documentName}".`);
        }
    }
    async onDisconnect(data) {
        if (this.configuration.onDisconnect) {
            this.log(`Connection to "${data.documentName}" closed.`);
        }
    }
    async onUpgrade(data) {
        if (this.configuration.onUpgrade) {
            this.log('Upgrading connection …');
        }
    }
    async onRequest(data) {
        if (this.configuration.onRequest) {
            this.log(`Incoming HTTP Request to ${data.request.url}`);
        }
    }
    async onDestroy(data) {
        if (this.configuration.onDestroy) {
            this.log('Shut down.');
        }
    }
    log(message) {
        const date = (new Date()).toISOString();
        let meta = `${date}`;
        if (this.name) {
            meta = `${this.name} ${meta}`;
        }
        message = `[${meta}] ${message}`;
        this.configuration.log(message);
    }
}

export { Logger };
//# sourceMappingURL=hocuspocus-logger.esm.js.map
