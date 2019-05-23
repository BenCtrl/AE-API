import express, {Application, Request, Response} from 'express';   //imports the express module
import mysql, {Connection} from 'mysql';
import path from 'path';
import moment, { Moment } from 'moment';


class Server {

    app: Application;                                                                           //initialises the express module into a variables
    port: String | number;
    date: string;

    sqlDB: DB = new DB();                                                                       //Instantiates the DB class

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3200;
        this.date = '';
        setInterval(() => {
            this.date = moment().format('DD/MM/YYYY hh:mm:ss');
        }, 1000);
    }

    main() {
        this.initialiseExpress();
        this.buildServer();
    }

    initialiseExpress() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
    }

    buildServer() {
        this.app.get('/api', (request: Request, respond: Response) => {                         //A function that is invoked when a GET request is made to the set path ('test-path')
            respond.send('API running...');                                                     //the "respond" object followed by a "send" function.
        });

        this.app.post('/api/visitor/signin', (req, res) => {                                    //This is activated whenever a user makes a POST request to the URL 'localhost:3200/api/visitors'
            const visitor = {
                name : req.body.name,
                comp: req.body.company,
                pers: req.body.person,
                reas: req.body.reason
            }
            console.log(req.body);
            res.send(`[${this.date}] Visitor ${req.body.name} Signed in!`);
            this.sqlDB.addVisitor(visitor);
        });

        this.app.post('/api/visitor/signout', (req, res) => {                                    //req is what is passed into the function, res is the response of this app on this server.
            const name = req.body.name;
            console.log(req.body);
            res.send(`[${this.date}] Visitor ${req.body.name} Signed out!`);
            this.sqlDB.signoutVisitor(name);
        });

        this.app.get('/api/visitor/list', (req, res) => {                                       //req is what is passed into the function, res is the response of this app on this server.
            const sqlQuery = `SELECT * FROM visitor_signin WHERE sign_out_date IS null`;
            this.sqlDB.db.query(sqlQuery, (error, result) => {                                  //Will actually query the DB and returns either a response or an error.
                if(error) throw error; 
                res.json(result);
                //console.log(`[${this.date}] Returned Active Users!`);
            });
        });

        this.app.listen(this.port, () => {                                                      //Establishes a server for this app (localhost:port-number)
            console.log(`Server launched on port ${this.port}`);
            console.log(`${'\n'}       -=Interlink Visitor Audit API=-${'\n'}Use endpoint: "/api" to verify API operational...`);
        });       
    }

}

interface Visitor{                                                                              //Essentially a custom data type which can be used to ensure parameters follow this structure.
    name: string,
    comp: string,
    pers: string,
    reas: string
}

class DB { 

    db: Connection;

    constructor() {
        this.db = mysql.createConnection({
            host: 'localhost',
            user: 'cartwrightb',
            password: 'dbadmin',
            database: 'audit_dashboard' 
        });
        this.connectToDB();
    }

    main() {
        
    }

    connectToDB(){
        this.db.connect();
    }

    addVisitor(visitor: Visitor){
        let sqlQuery = `INSERT INTO visitor_signin(v_name, v_company, v_person, v_reason) VALUES (?, ?, ?, ?);`;
        const inserts = [visitor.name, visitor.comp, visitor.pers, visitor.reas];
        sqlQuery = mysql.format(sqlQuery, inserts);
        console.log(sqlQuery);
        this.db.query(sqlQuery, (error, result) => {                              //Will actually query the DB and returns either a response or an error.
            if(error) throw error;
            console.log(`Row Inserted!`);
        });
    }
    
    signoutVisitor(name: string){
        let sqlQuery = `UPDATE visitor_signin SET sign_out_date= now() WHERE v_name= ? ;`;
        const inserts = [name];
        sqlQuery = mysql.format(sqlQuery, inserts);
        this.db.query(sqlQuery, (error, result) => {
            if(error) throw error;
            console.log('Visitor Signed Out');
        });
    }
}


const serv : Server = new Server();    //Instatiates the main server class
serv.main();                           //API entry point.
