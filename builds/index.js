"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); //imports the express module
const mysql_1 = __importDefault(require("mysql"));
const moment_1 = __importDefault(require("moment"));
class Server {
    constructor() {
        this.sqlDB = new DB(); //Instantiates the DB class
        this.app = express_1.default();
        this.port = process.env.PORT || 3200;
        this.date = '';
        setInterval(() => {
            this.date = moment_1.default().format('DD/MM/YYYY hh:mm:ss');
        }, 1000);
    }
    main() {
        this.initialiseExpress();
        this.buildServer();
    }
    initialiseExpress() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: false }));
    }
    buildServer() {
        this.app.get('/api', (request, respond) => {
            respond.send('API running...'); //the "respond" object followed by a "send" function.
        });
        this.app.post('/api/visitor/signin', (req, res) => {
            const visitor = {
                name: req.body.name,
                comp: req.body.company,
                pers: req.body.person,
                reas: req.body.reason
            };
            console.log(req.body);
            res.send(`[${this.date}] Visitor ${req.body.name} Signed in!`);
            this.sqlDB.addVisitor(visitor);
        });
        this.app.post('/api/visitor/signout', (req, res) => {
            const name = req.body.name;
            console.log(req.body);
            res.send(`[${this.date}] Visitor ${req.body.name} Signed out!`);
            this.sqlDB.signoutVisitor(name);
        });
        this.app.get('/api/visitor/list', (req, res) => {
            const sqlQuery = `SELECT * FROM visitor_signin WHERE sign_out_date IS null`;
            this.sqlDB.db.query(sqlQuery, (error, result) => {
                if (error)
                    throw error;
                res.json(result);
                //console.log(`[${this.date}] Returned Active Users!`);
            });
        });
        this.app.listen(this.port, () => {
            console.log(`Server launched on port ${this.port}`);
            console.log(`${'\n'}       -=Interlink Visitor Audit API=-${'\n'}Use endpoint: "/api" to verify API operational...`);
        });
    }
}
class DB {
    constructor() {
        this.db = mysql_1.default.createConnection({
            host: 'localhost',
            user: 'cartwrightb',
            password: 'dbadmin',
            database: 'audit_dashboard'
        });
        this.connectToDB();
    }
    main() {
    }
    connectToDB() {
        this.db.connect();
    }
    addVisitor(visitor) {
        let sqlQuery = `INSERT INTO visitor_signin(v_name, v_company, v_person, v_reason) VALUES (?, ?, ?, ?);`;
        const inserts = [visitor.name, visitor.comp, visitor.pers, visitor.reas];
        sqlQuery = mysql_1.default.format(sqlQuery, inserts);
        console.log(sqlQuery);
        this.db.query(sqlQuery, (error, result) => {
            if (error)
                throw error;
            console.log(`Row Inserted!`);
        });
    }
    signoutVisitor(name) {
        let sqlQuery = `UPDATE visitor_signin SET sign_out_date= now() WHERE v_name= ? ;`;
        const inserts = [name];
        sqlQuery = mysql_1.default.format(sqlQuery, inserts);
        this.db.query(sqlQuery, (error, result) => {
            if (error)
                throw error;
            console.log('Visitor Signed Out');
        });
    }
}
const serv = new Server(); //Instatiates the main server class
serv.main(); //API entry point.
