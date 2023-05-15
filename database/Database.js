/* 
 *  TODO
 *  Cache non-changing data
 *  Validate queries match schema
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const SqlQueryBuilder = require('./SqlQueryBuilder.js');

class Database {
    #path;
    #db;
    #new_db = false;        //If new db, have to create tables. will do in child database class

    constructor(path) {
        this.#path = path;
    }

    async init_base(schema, table_data) {
        //Use init function for async things that cannot be done in constructor
        this.#db = await this.load_database();

        if (this.#new_db) {
            await this.create_tables(schema);
            this.populate_tables(table_data);
        }

        return this;
    }
    
    async load_database() {
        if (!fs.existsSync(this.#path)) {
            this.#new_db = true;
            return this.create_db();
        } else {
            this.#new_db = false;
            return this.load_existing_db();
        }
    }

    async load_existing_db() {
        return await new Promise(resolve => {
            this.#db = new sqlite3.Database(this.#path, sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(this.#db);
                }
            });
        })
    }

    async create_db() {
        return await new Promise(resolve => {
            this.#db = new sqlite3.Database(this.#path, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(this.#db);
                }
            });
        })
    }

    async create_tables(schema) {
        let array_of_promises = new Array();
        for (const sql of schema) {
            array_of_promises.push(this.create_table(sql));
        }
        await Promise.all(array_of_promises);
    }

    async create_table(sql) {
        return await new Promise((resolve, reject) => {
            this.#db.run(sql, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async populate_tables(table_data) {         // [{ table: table_name, columns: [arr of col names], values_2d_array: [2d arr of values (1d array of value for each column)] }]
        let array_of_promises = new Array();
        for (const table of table_data) {
            this.populate_table(table.table, table.columns, table.values_2d_array, array_of_promises);
        }
        await Promise.all(array_of_promises);
    }

    async populate_table(table, columns, values_2d_arr, array_of_promises) {
        for (const values_1d_arr of values_2d_arr) {
            let sql = new SqlQueryBuilder().insert_into_values(table, columns, values_1d_arr).get_result();
            array_of_promises.push(this.query_run(sql));
        }
    }

    async query_run(sql_builder_result) {
        return await new Promise((resolve, reject) => {
            this.#db.run(sql_builder_result.sql, sql_builder_result.variables, function(err) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            })
        });

        //returns primary key autoincrement value for INSERT queries, otherwise null
    }

    async query_all(sql_builder_result) {
        return await new Promise((resolve, reject) => {
            this.#db.all(sql_builder_result.sql, sql_builder_result.variables, (err, rows) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            })
        });

        //returns array of objects
        //[ { key: value, key: value }, { key: value, key: value } ]
    }

    async query_get(sql_builder_result) {
        return await new Promise((resolve, reject) => {
            this.#db.get(sql_builder_result.sql, sql_builder_result.variables, (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(row);
                }
            })
        });

        //returns single object
        //{ key: value, key: value }
    }
}

module.exports = Database;