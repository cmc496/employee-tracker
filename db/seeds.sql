INSERT INTO department (department_name)
VALUES
("Manager"),
("Sales"),
("Engineering"),
("Finance"),
("Legal");

INSERT INTO roles (title, salary, department_id)
VALUES
("Salesperson", "80000", 2),
("Lead Engineer", "150000", 3),
("Software Engineer", "120000", 3),
("Account Manager", "160000", 4),
("Accountant", "125000", 4),
("Legal Team Lead", "250000", 5),
("Lawyer", "190000", 5);

INSERT INTO employee (first_name, last_name, role_id)
VALUES
("Mike", "Chan", 1),
("Ashley", "Rodriguez", 2),
("Kevin", "Tupik", 3),
("Kunal", "Singh", 4),
("Malia", "Brown", 5),
("Sarah", "Lourd", 6),
("Tom", "Allen", 7);

UPDATE `employee_tracker`.`employee` SET `manager_id` = '1' WHERE (`id` > '1');

