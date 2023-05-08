/* 
 *  TODO
 *  Cache non-changing data
 *  Track schemas
 *      schema { table_name: { column_name: data_type } }
 *          track more info? { table_name: { column_name: { data_type: typeof, not_null: bool, primary_key: bool, etc... } } }
 *  Validate queries match schema
 */

class Database {
    #path;
    #db;
    #new_db = false;        //If new db, have to create tables. will do in child database class
    #cache = {};
    #schema = {};

    constructor(path) {
        this.#path = path;
    }

    async init() {
        //Use init function for async things that cannot be done in constructor
        //Construct obj by const db = new Database().init();
        this.#db = Promise.all([load_database()])[0];


        return this;
    }
    
    async load_database() {
        if (!fs.existsSync(this.#path)) {
            this.#new_db = false;
            return create_db();
        }
        else {
            this.#new_db = true;
            return load_existing_db();
        }
    }

    async load_existing_db() {
        return await new Promise(resolve => {
            let db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
                if (err) reject(err);
                else resolve(db);
            });
        })
    }

    async create_db() {
        return await new Promise(resolve => {
            let db = new sqlite3.Database(db_path, (err) => {
                if (err) reject(err);
                else resolve(db);
            });
        })
    }

    async query_run(sql_builder_result) {
        return await new Promise((resolve, reject) => {
            this.#db.run(sql_builder_result.sql, sql_builder_result.variables, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve();
                }
            })
        });

        //returns void
    }

    async query_all() {
        return await new Promise((resolve, reject) => {
            this.#db.all(sql_builder_result.sql, sql_builder_result.variables, (err, rows) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            })
        });

        //returns array of objects
        //[ { key: value, key: value }, { key: value, key: value } ]
    }

    async query_get() {
        return await new Promise((resolve, reject) => {
            this.#db.get(sql_builder_result.sql, sql_builder_result.variables, (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(row);
                }
            })
        });

        //returns single object
        //{ key: value, key: value }
    }
}

module.exports = {
    Database
}