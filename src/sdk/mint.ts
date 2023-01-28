export default class MintDB {
    url: string;
    subscriptions: string[];
    ws: WebSocket | null;
    constructor(url: string = "", subscriptions: string[] = []) {
        this.url = url;
        this.subscriptions = subscriptions;
        this.ws = null;
    }
    async signup(username: string, password: string) {
        const endpoint = "/auth";
        const data = {
            event: "signup",
            username,
            password
        };
        try {
            const res = await this.httpRequest(data, endpoint);
            localStorage.setItem("jwt", res.token);
        } catch (error) {
            console.log(error);
        }
    }
    async signin(username: string, password: string) {
        const endpoint = "/auth";
        const data = {
            event: "signin",
            username,
            password
        };
        try {
            const res = await this.httpRequest(data, endpoint);
            localStorage.setItem("jwt", res.token);
        } catch (error) {
            console.log(error);
        }
    }
    async signout(username: string) {
        const endpoint = "/auth";
        const data = {
            event: "signout",
            username,
        };
        try {
            const res = await this.httpRequest(data, endpoint);
            localStorage.removeItem("jwt");
        } catch (error) {
            console.log(error);
        }
    }
    async registerWebSocket() {
        const data = {
            user_id: 1,
        }
        const res = await fetch(this.url + "/register", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    }
    async listen() {
        const { url } = await this.registerWebSocket();
        console.log(url);
        this.ws = new WebSocket(url);
        console.log("listening!");
    }
    onEvent(cb: (msg: Event) => void) {
        if (this.ws) {
            this.ws.onmessage = function(ev: Event) {
                cb(ev);
            }

        }
    }
    async listenOn(subscriptions: string[], callback: (ev: Event) => void) {
        const { url } = await this.registerWebSocket();
        this.ws = new WebSocket(url);

        if (this.ws) {
            this.ws.onmessage = function(ev: Event) {
                callback(ev);
            }
        }
    }
    addSubscription(sub: string) {
        this.subscriptions.push(sub);
        this.updateSubcriptionList();
    }
    removeSubscription(subscription: string) {
        this.subscriptions = this.subscriptions.filter(sub => sub != subscription);
        this.updateSubcriptionList();
    }

    updateSubcriptionList() {
        let data = {
          "topics": this.subscriptions
        }
        this.ws?.send(JSON.stringify(data));
    }
    closeWS() {
        this.ws?.close(1000, "User Disconnect");
    }
    async publish(topic: string, user_id: number, msg: string) {
        const data = { topic, user_id, msg };
        const res = await fetch(this.url + "/publish", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    }
    async getTableList() {
        const data = {
            stmt: "INFO",
            tb: "",
            doc: "",
            data: {},
            topic: "",
            user_id: 1,
            message: "" 
        }
        return await this.httpRequest(data); 
    }
    async createTable(table: string) {
        const data = {
            stmt: "ADD",
            tb: table,
            doc: "",
            data: {},
            topic: "",
            user_id: 1,
            message: ""    
        };
        return await this.httpRequest(data); 
    }

    async addDoc(tb: string, doc: string, docData: Record<string, any>) {
        const data = {
            stmt: "CREATE",
            tb: tb,
            doc: doc,
            data: docData,
            topic: "",
            user_id: 1,
            message: ""    
        }
        return this.httpRequest(data);
    }
    async merge(tb: string, doc: string, docData: Record<string, any>) {
        const data = {
            stmt: "MERGE",
            tb: tb,
            doc: doc,
            data: docData,
            topic: "",
            user_id: 1,
            message: ""    
        }
        console.log(data);
        return this.httpRequest(data);
    }
    async getOne(table: string, doc: string) {
        const data = {
            stmt: "SELECT",
            tb: table,
            doc: doc,
            data: {},
            topic: "",
            user_id: 1,
            message: ""    
        };
        return await this.httpRequest(data);
    }
    async getAll(table: string) {
        const data = {
            opts: "",
            sql: "",
            data: {},
            stmt: "SELECT",
            tb: table,
            doc: "*",
            topic: "",
            user_id: 1,
            message: ""    
        };
        return await this.httpRequest(data);
    }

    async find(tb: string, search: Record<string, any>) {
        // filters = {"city": "Clearwater"}
        const data = {
            stmt: "FIND",
            tb: tb,
            doc: "",
            data: search,
            topic: "",
            user_id: 1,
            message: ""
        };
        return await this.httpRequest(data);
    }
    async addEdge(tb: string, edge: Record<string, any>) {
        const data = {
            stmt: "EDGE",
            tb: tb,
            data: edge,
            doc: "",
            topic: "",
            user_id: 1,
            message: ""
        };
        return await this.httpRequest(data);
    }
    async customSql(data: Record<string, any>) {
        const res = await this.httpRequest(data);
        return JSON.stringify(res);
    }
    async httpRequest(data = {}, endpoint = "/sql") {
        const res = await fetch(this.url + endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${""}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    }
}