CREATE TABLE Department (
    id INT AUTO_INCREMENT PRIMARY_KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(10) DEFAULT 'employee',
    position VARCHAR(100) DEFAULT NULL,
    phoneNumber VARCHAR(10) DEFAULT NULL,
    departmentId INT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (departmentId) REFERENCES Department(id)
);

CREATE TABLE EvaluationAllocation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluationId INT INT NOT NULL,
    evaluateeId INT NOT NULL,
    evaluatorId INT NOT NULL,
    evaluationComment TEXT,
    evaluatorRole VARCHAR(100),
    status VARCHAR(10) DEFAULT 'pending',
    signatureData TEXT,
    signatureDate DATETIME DEFAULT NULL,
    submittedAt DATETIME DEFAULT NULL,
    FOREIGN KEY (evaluationId) REFERENCES Evaluation(id),
    FOREIGN KEY (evaluatorId) REFERENCES Employee(id),
    FOREIGN KEY (evaluateeId) REFERENCES Employee(id)
);

CREATE TABLE Evaluation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(50) NOT NULL,
    evaluationYear INT NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL
);

CREATE TABLE SelfIndicatorResult (
    id INT AUTO_INCREMENT PRIMARY KEY,
    allocationId INT,
    indicatorId INT,
    selectedLevelId INT,
    evidenceUrl VARCHAR(100) DEFAULT NULL,
    evidenceFilePath VARCHAR(100)DEFAULT NULL,
    FOREIGN KEY (allocationId) REFERENCES EvaluationAllocation(id),
    FOREIGN KEY (indicatorId) REFERENCES Indicator(id),
    FOREIGN KEY (selectedLevelId) REFERENCES IndicatorLevel(id)
);

CREATE TABLE IndicatorResult (
    id INT AUTO_INCREMENT PRIMARY KEY,
    allocationId INT,
    indicatorId INT,
    selectedLevelId INT,
    FOREIGN KEY (allocationId) REFERENCES EvaluationAllocation(id),
    FOREIGN KEY (indicatorId) REFERENCES Indicator(id),
    FOREIGN KEY (selectedLevelId) REFERENCES IndicatorLevel(id)
);

CREATE TABLE EvaluationTopic (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    evaluationId INT,
    FOREIGN KEY (evaluationId) REFERENCES Evaluation(id)
);

CREATE TABLE Indicator (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    topicId INT,
    evidenceDescription TEXT,
    indicatorType VARCHAR(50) NOT NULL,
    weight DECIMAL(10,2) DEFAULT 1.00,
    FOREIGN KEY (topicId) REFERENCES EvaluationTopic(id)
);

CREATE TABLE IndicatorLevel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    level VARCHAR(10),
    indicatorId INT ,
    FOREIGN KEY (indicatorId) REFERENCES Indicator(id)
);
