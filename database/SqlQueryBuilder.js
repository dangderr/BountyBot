/*  TODO:
 *  Validation
 *      Queries built in the right order
 *  Data validation
 *      Tables exist in db
 *      Columns exist in table
 *      Data types match for column
 *      Validation should be done in calling function, not here
 *          Can validate here that all data from
 *          a given column are of the same data type
 */

class SqlQueryBuilder {
    #sql = '';
    #invalid = false;
    #variables = [];

    select(columns_arr, aliases_arr) {
        if (!this.#validate_argument_array_type(1, columns_arr, aliases_arr)) {
            return this.#invalidate();
        }

        this.#sql += 'SELECT ';
        if (!aliases_arr) {
            this.#sql += columns_arr.join(', ');
        } else {
            for (let i in columns_arr) {
                this.#sql += columns_arr[i] + ' ' + aliases_arr[i];
                if (i != columns_arr.length - 1) {
                    this.#sql += ', ';
                }
            }
        }
        this.#sql += ' ';
        return this;
    }

    update(table, alias) {
        if (!this.#validate_argument_string_type(table, alias)) {
            return this.#invalidate();
        }

        this.#sql += 'UPDATE ';
        this.#sql += table + ' ';
        if (alias != null) {
            this.#sql += alias + ' ';
        }
        return this;
    }

    insert_into_values(table, columns_arr, values_arr) {
        if (!this.#validate_argument_string_type(table) ||
            !this.#validate_argument_array_type(1, columns_arr)
        ) {
            return this.#invalidate();
        }

        const placeholders = values_arr.map(() => "?").join(",");

        this.#sql += 'INSERT INTO ';
        this.#sql += table + '(';
        this.#sql += columns_arr.join(', ');
        this.#sql += ') ';
        this.#sql += 'VALUES (';
        this.#sql += placeholders;
        this.#sql += ') ';

        for (let value of values_arr) {
            this.#variables.push(value);
        }

        return this;
    }

    delete_from(table, alias) {
        this.#sql += 'DELETE ';
        return this.from(table, alias);
    }

    from(table, alias) {
        if (!this.#validate_argument_string_type(table, alias)) {
            return this.#invalidate();
        }

        this.#sql += 'FROM ';
        this.#sql += table + ' ';
        if (alias != null) {
            this.#sql += alias + ' ';
        }
        return this;
    }

    set(columns_arr, values_arr) {
        if (!this.#validate_argument_array_type(2, columns_arr, values_arr)) {
            return this.#invalidate();
        }

        this.#sql += 'SET ';
        for (let i in columns_arr) {
            this.#sql += columns_arr[i] + ' = ?';
            this.#variables.push(values_arr[i]);
            if (i != columns_arr.length - 1) {
                this.#sql += ' AND ';
            }
        }
        this.#sql += ' ';
        return this;
    }

    where_column_equals(columns_arr, values_arr) {
        if (!this.#validate_argument_array_type(2, columns_arr, values_arr)) {
            return this.#invalidate();
        }

        if (!this.#sql.includes('WHERE'))
            this.#sql += 'WHERE ';
        for (let i in columns_arr) {
            this.#sql += columns_arr[i] + ' = ?';
            this.#variables.push(values_arr[i]);
            if (i != columns_arr.length - 1) {
                this.#sql += ' AND ';
            }
        }
        this.#sql += ' ';
        return this;
    }

    where_column_in(column, values_arr) {
        if (!this.#validate_argument_string_type(column) ||
            !this.#validate_argument_array_type(1, values_arr)
        ) {
            return this.#invalidate();
        }

        const placeholders = values_arr.map(() => "?").join(",");

        if(!this.#sql.includes('WHERE'))
            this.#sql += 'WHERE ';
        this.#sql += column + ' IN ';
        this.#sql += '(' + placeholders + ')';
        for (let value of values_arr) {
            this.#variables.push(value);
        }
        return this;
    }

    distinct() {
        if (this.#sql.includes('SELECT'))
            this.#sql.replace('SELECT', 'SELECT DISTINCT');
        return this;
    }

    and() {
        this.#sql += ' AND ';
        return this;
    }

    #validate_argument_string_type(first_str, second_str) {
        if (this.#invalid) {
            return false;
        }
        if (typeof first_str != 'string') {
            return false;
        }
        if (second_str != null && typeof second_str != 'string') {
            return false;
        }
        return true;
    }

    #validate_argument_array_type(num_required_arrays, first_arr, second_arr) {
        if (this.#invalid) {
            return false;
        }
        if (num_required_arrays == 1) {
            if (!Array.isArray(first_arr)) {
                return false;
            }
            if (second_arr != null) {
                if (!Array.isArray(second_arr)) {
                    return false;
                }
                if (first_arr.length != second_arr.length) {
                    return false;
                }
            }
        } else if (num_required_arrays == 2) {
            if (!Array.isArray(first_arr) || !Array.isArray(second_arr)) {
                return false;
            }
            if (first_arr.length != second_arr.length) {
                return false;
            }
        } else {
            return false;
        }
        return true;
    }

    #invalidate() {
        this.#invalid = true;
        return this;
    }

    get_result() {
        if (this.#invalid)
            return null;
        return {
            sql: this.#sql,
            variables: this.#variables
        };
    }
}

module.exports = SqlQueryBuilder;