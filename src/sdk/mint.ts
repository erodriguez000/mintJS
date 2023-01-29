import { AuthRequest, Compare, CompareStatement, Key, SQL, SQLPatch, Token, WebSocketURL } from "../types";
import WebSocket = require("ws");

export default class MintDB {
    url: string;
    subscriptions: string[];
    ws: WebSocket | null;
    constructor(url: string = "", subscriptions: string[] = []) {
        this.url = url;
        this.subscriptions = subscriptions;
        this.ws = null;
    }
    async signup(username: string, password: string): Promise<Token | undefined> {
        const endpoint = "/auth";
        const data: AuthRequest = {
            event: "signup",
            username,
            password
        };
        try {
            return await this.httpRequest(data, endpoint);
            // TODO: Update to Token struct as response
            // localStorage.set("jwt", res);
        } catch (error) {
            console.log(error);
        }
    }
    async signin(username: string, password: string): Promise<Token|undefined> {
        const endpoint = "/auth";
        const data: AuthRequest = {
            event: "signin",
            username,
            password
        };
        try {
            const res: Token = await this.httpRequest(data, endpoint);
            console.log(res)
            // localStorage.set("jwt", res);
            return res
        } catch (error) {
            console.log(error);
        }
    }
    async signout(username: string): Promise<string|undefined> {
        const endpoint = "/auth";
        const data: AuthRequest = {
            event: "signout",
            username,
            password: "",
        };
        try {
            const res: string = await this.httpRequest(data, endpoint);
            // localStorage.remove("jwt");
            return res;
        } catch (error) {
            console.log(error);
        }
    }
    async registerWebSocket(): Promise<WebSocketURL> {
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
        this.ws = new WebSocket(url);
    }
    async on(subscriptions: string[] = [], callback: (ev: MessageEvent<any>) => void) {
        const { url } = await this.registerWebSocket();
        this.ws = new WebSocket(url);
        this.ws.onopen = () => {
            if (this.ws) {
                subscriptions.forEach((s) => this.addSubscription(s));
                this.ws.onmessage = () => callback;
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

    private updateSubcriptionList() {
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
    async getTableList(): Promise<string[]> {
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
    async addTable(table: string) {
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

    async addDoc(tb: string, doc: string, docData: Record<string, any>): Promise<Record<string, any>> {
        const data = {
            stmt: "CREATE",
            tb: tb,
            doc: doc,
            data: docData,
            topic: "",
            user_id: 1,
            message: ""    
        }
        return await this.httpRequest(data);
    }
    async merge(tb: string, doc: string, docData: Record<string, any>): Promise<Record<string, any>> {
        const data = {
            stmt: "MERGE",
            tb: tb,
            doc: doc,
            data: docData,
            topic: "",
            user_id: 1,
            message: ""    
        }
        return await this.httpRequest(data);
    }
    async push(tb: string, doc: string, docData: SQLPatch): Promise<Record<string, any>> {
        const data = {
            stmt: "PUSH",
            tb: tb,
            doc: doc,
            data: docData,
            topic: "",
            user_id: 1,
            message: ""    
        }
        console.log(data);
        return await this.httpRequest(data);
    }
    async put(tb: string, doc: string, docData: SQLPatch): Promise<Record<string, any>> {
        const data = {
            stmt: "PUT",
            tb: tb,
            doc: doc,
            data: docData,
            topic: "",
            user_id: 1,
            message: ""    
        }
        console.log(data);
        return await this.httpRequest(data);
    }
    async getOne(table: string, doc: string): Promise<Record<string, any>> {
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
    async getAll(table: string): Promise<Record<string, any>[]> {
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

    async find(tb: string, search: Record<string, any>): Promise<Record<string, any>[]> {
        // filters = {"city": "Clearwater"}
        const data: SQL = {
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
    async match(tb: string, search: Record<string, any>): Promise<Record<string, any>[]> {
        // filters = {"city": "Clearwater"}
        const data: SQL = {
            stmt: "MATCH",
            tb: tb,
            doc: "",
            data: search,
            topic: "",
            user_id: 1,
            message: ""
        };
        return await this.httpRequest(data);
    }
    async where(tb: string, search: Compare): Promise<Record<string, any>[]> {
        const data: CompareStatement = {
            stmt: "COMPARE",
            tb: tb,
            doc: "",
            data: search,
            topic: "",
            user_id: 1,
            message: ""
        }
        return await this.httpRequest(data);
    }
    async deleteKey(tb: string, doc: string, key: Key): Promise<Record<string, any>> {
        const data = {
            stmt: "DELETE",
            tb: tb,
            doc: doc,
            data: key,
            topic: "",
            user_id: 1,
            message: ""    
        }
        return await this.httpRequest(data);
    }
    async deleteDocument(tb: string, doc: string): Promise<Record<string, any>> {
        const data = {
            stmt: "DELETE",
            tb: tb,
            doc: doc,
            data: {},
            topic: "",
            user_id: 1,
            message: ""    
        }
        return await this.httpRequest(data);
    }
    async deleteKeyFromTable(tb: string, key: string): Promise<string> {
        const data = {
            stmt: "DELETE",
            tb: tb,
            doc: "*",
            data: { key },
            topic: "",
            user_id: 1,
            message: ""    
        }
        return await this.httpRequest(data);
    }
    async addEdge(tb: string, doc: string, rel_tb: string, rel_doc: string, rel: string): Promise<Record<string, any>> {
        const data: SQL = {
            stmt: "REL",
            tb: tb,
            data: {
                rel_tb,
                rel_doc,
                rel
            },
            doc: "",
            topic: "",
            user_id: 1,
            message: ""
        };
        return await this.httpRequest(data);
    }
    async bfs(tb: string, doc: string, rel: string, target_doc: string): Promise<Record<string,any>> {
        const data: SQL = {
            stmt: "BFS",
            tb: tb,
            data: {
                target_doc,
                rel
            },
            doc: "",
            topic: "",
            user_id: 1,
            message: ""
        };
        return await this.httpRequest(data);
    }
    async dfs(tb: string, doc: string, rel: string, target_doc: string): Promise<Record<string,any>> {
        const data: SQL = {
            stmt: "DFS",
            tb: tb,
            data: {
                target_doc,
                rel
            },
            doc: "",
            topic: "",
            user_id: 1,
            message: ""
        };
        return await this.httpRequest(data);
    }
    async customSql(data: SQL) {
        const res = await this.httpRequest(data);
        return JSON.stringify(res);
    }
    private async httpRequest(data = {}, endpoint = "/sql"): Promise<any> {
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