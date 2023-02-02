import MintDB from "../src/index";
import { Compare, Token } from "../src/types";

describe("MintDB", () => {
    let mint: MintDB;

    beforeEach(() => {
        mint = new MintDB("http://127.0.0.1:8000");
    });

    test("getTableList() returns a list of tables", async () => {
        const tables: string[] = await mint.getTableList();
        expect(Array.isArray(tables)).toBe(true);
    });

    test("getOne() gets one document", async () => {
        const document: Record<string, any> = await mint.getOne("car", "car:1");
        expect(typeof document === "object").toBe(true);
        expect(document.id === "car:1").toBe(true);
    });
    test("getAll() gets all documents from a table", async () => {
        const documents = await mint.getAll("car");
        expect(Array.isArray(documents)).toBe(true);
        expect(documents[0].id === "car:1").toBe(true);
    });
    test("find() selects all documents with the given values", async () => {
        const search = {
            make: "Mercedes-Benz",
            model: "G-Wagon"
        }
        const documents: Record<string, any>[] = await mint.find("car", search);
        expect(Array.isArray(documents)).toBe(true);
        expect(documents.length > 1).toBe(true);
    });
    test("match() selects all documents with the given values", async () => {
        const search = {
            make: "Mercedes-Benz",
            model: "G-Wagon"
        }
        const documents: Record<string, any>[] = await mint.match("car", search);
        expect(Array.isArray(documents)).toBe(true);
        expect(documents.length === 1).toBe(true);
    });
    test("where() filters documents by given comparison", async () => {
        const res = await mint.where("car", "model", "icontains", "amg");
        expect(Array.isArray(res)).toBe(true);
    });
    test("signup returns jwt", async () => {
        const token: Token | undefined = await mint.signup("lucy@gmail.com", "abc123");
        console.log(token?.token);
    });
    test("signin returns jwt", async () => {
        const token: Token | undefined = await mint.signin("lucy@gmail.com", "abc123");
        console.log(token?.token);
    });
    test("signout signs user out", async () => {
        let jwt: Token | undefined = await mint.signin("lucy@gmail.com", "abc123");
        console.log(jwt);
        if (jwt) {
            let res: string | undefined = await mint.signout(jwt?.token);
            console.log(res);
        }
    });
});