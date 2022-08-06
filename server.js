const mysql = require('mysql2');
const consoleTable = require('console.table');
const inquirer = require('inquirer');
const connection = require('./config/connection');

const start = ['View Employees', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'View Roles', 'Add Role', 'View Departments', 'Add Department', 'Exit'];

const queryEmp = `SELECT employee.id, employee.first_name AS "First Name", employee.last_name AS "Last Name", roles.title, department.department_name AS "Department",
    IFNULL(roles.salary, "No Data") AS "Salary", CONCAT(manager.first_name," ", manager.last_name) AS "Manager"
    FROM employee
    LEFT JOIN roles
    ON roles.id = employee.role_id
    LEFT JOIN department
    ON department.id = roles.department_id
    LEFT JOIN employee manager ON manager.id = employee.manager_id
    ORDER BY employee.id;`

const questionEmp = ['What is first name of employee?', 'What is last name of employee?', 'What is role of employee?', 'Who is manager of employee?']

const questionRole = `SELECT * FROM roles; SELECT CONCAT (employee.first_name, " ",employee.last_name) AS full_name FROM employee;`

const run = () => {
    inquirer.prompt({
        name: 'Choices',
        type: 'list',
        message: 'Please select an option.',
        choices: start
    }) .then((answer) => {
        switch (answer.Choices) {
            case 'View Employees':
            showEmployees();
            break;
        case 'Add Employee':
            addEmployee();
            break;
        case 'Remove Employee':
            removeEmployee();
            break;
        case 'Update Employee Role':
            updateEmployee();
            break;
        case 'View Roles':
            viewRoles();
            break;
        case 'Add Role':
            addRole();
            break;
        case 'View Departments':
            viewDepartments();
            break;
        case 'Add Department':
            addDepartment();
            break;
        case 'Exit':
            connection.end();
            break;
        }
    })
}

const showEmployees = () => {
    connection.query(queryEmp, (err, result) => {
        if (err) throw err;
        console.log('');
        console.table(('All employees'), result)
        run();
    })
}

const addEmployee = () => {
    connection.query(questionRole, (err, result) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'firstName',
                type: 'input',
                message: questionEmp[0]
            },
            {
                name: 'lastName',
                type: 'input',
                choice: questionEmp[1]
            },
            {
                name: 'role',
                type: 'list',
                choices: function() {
                    let choices = result[0].map(choice => choice.title);
                    return choices;
                },
                message: questionEmp[2]
            },
            {
                name: 'manager',
                type: 'list',
                choices: function() {
                    let choices = result[1].map(choice => choice.full_name);
                    return choices;
                },
                message: questionEmp[3]
            }
        ]) .then((answer) => {
            connection.query(
                `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES(?, ?, (SELECT id FROM roles WHERE title = ? ),
            (SELECT id FROM (SELECT id FROM employee WHERE CONCAT(first_name," ",last_name) = ? ) AS tempTable))`, [answer.firstName, answer.lastName, answer.role, answer.manager]
            )
            run();
        })
    })
}

const removeEmployee = () => {
    connection.query(queryEmp, (err, result) => {
        if (err) throw err;
        console.log('');
        console.table(('All Employees'), result)

        inquirer.prompt([
            {
                name: 'removeID',
                type: 'input',
                message: 'Enter employee id you wish to remove:'
            }
        ]) .then((answer) => {
            connection.query(`DELETE FROM employee WHERE ?`, { id: answer.removeID });
            run();
        })
    })
}

const updateEmployee = () => {
    const retrieve = `SELECT CONCAT (first_name," ",last_name) AS full_name FROM employee; SELECT title FROM roles`

    connection.query(retrieve, (err, result) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'employee',
                type: 'list',
                choices: function() {
                    let choices = result[0].map(choice => choice.full_name);
                    return choices;
                },
                message: 'SELECT employee to update role:'
            },
            {
                name: 'role',
                type: 'list',
                choices: function() {
                    let choices = result[1].map(choice => choice.title);
                    return choices;
                }
            }
        ]) .then((answer) => {
            connection.query(`UPDATE employee SET role_id = (SELECT id FROM roles WHERE title = ?)
                WHERE id = (SELECT id FROM (SELECT id FROM employee WHERE CONCAT (first_name," ",last_name) = ?) AS tempTable)`, [answer.role, answer.employee], (err, result) => {
                    if (err) throw err;
                    run();
                })
        })
    })
}

const viewRoles = () => {
    let retrieve = `SELECT title AS "Title", salary AS "Salary", id AS "ID" FROM roles`;
    connection.query(retrieve, (err, result) => {
        if (err) throw err;
        console.log('');
        console.table(('All roles displayed:'), result);
        run();
    })
}

const addRole = () => {
    const retrieve = `SELECT * FROM roles; SELECT * FROM department`;

    connection.query(retrieve, (err, result) => {
        if (err) throw err;
        console.log('');
        console.table(('List of all roles:'), result[0]);
        
        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'Enter title of role to add:'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'Enter salary for new role:'
            },
            {
                name: 'department',
                type: 'list',
                choices: function() {
                    let choices = result[1].map(choice => choice.department_name);
                    return choices;
                },
                message: 'Select department for new role:'
            }
        ]) .then((answer) => {
            connection.query(
                `INSERT INTO roles (title, salary, department_id)
                VALUES
                ("${answer.title}", "${answer.salary}", (SELECT id FROM department WHERE department_name = "${answer.department}"));`
            )
            run();
        })
    })
}

const viewDepartments = () => {
    const retrieve = `SELECT department_name AS "Department", id AS "Department ID" FROM department`;
    connection.query(retrieve, (err, result) => {
        if (err) throw err;
        console.log('');
        console.table(('All departments displayed:'), result)
        run();
    })
}

const addDepartment = () => {
    const retrieve = `SELECT department_name AS "Department" FROM department`;

    connection.query(retrieve, (err, result) => {
        if (err) throw err;
        console.log('');
        console.table(('List of departments:'), result);

        inquirer.prompt([
            {
                name: 'department',
                type: 'input',
                message: 'Enter name of new department:'
            }
        ]) .then((answer) => {
            connection.query(`INSERT INTO department(department_name) VALUES( ? )`, answer.department)
            run();
        })
    })
}

run();