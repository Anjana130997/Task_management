import {Low} from "lowdb"; //manages reading and writing data asynchronously
import {JSONFile} from "lowdb/node";
import {join} from "path";

const file=join(process.cwd(),"backend","db.json"); //Defines the physical file location.
const adapter=new JSONFile(file); //Creates the connection to the file.
const db=new Low(adapter); //Creates the Database Instance.

await db.read(); //Loads data into memory.
db.data ||={
    user:[],
    tasks:[],
    comments:[]
}
await db.write(); //Saves the current state (including new defaults).

export default db;
