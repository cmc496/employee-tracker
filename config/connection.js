const mysql = require ('mysql2');

connection = mysql.createConnection({
    host: 'localHost',
    port: 3306,
    user: 'root',
    password: 'Cait.My99',
    database: 'employee-tracker',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Connected to database');
});

module.export = connection;