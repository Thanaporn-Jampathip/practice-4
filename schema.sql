-- Department table (ต้องสร้างก่อน เพราะ Employee อ้างอิง)
CREATE TABLE Department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee table
CREATE TABLE Employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee' COMMENT 'บทบาท: admin/evaluator/employee',
    position VARCHAR(100) DEFAULT NULL COMMENT 'ตำแหน่งงาน',
    phoneNumber VARCHAR(20) DEFAULT NULL COMMENT 'เบอร์โทรศัพท์',
    departmentId INT DEFAULT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (departmentId) REFERENCES Department(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Evaluation table (ต้องสร้างก่อน EvaluationAllocation)
CREATE TABLE Evaluation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period VARCHAR(50) NOT NULL,
    evaluationYear INT NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- EvaluationTopic table (ต้องสร้างก่อน Indicator)
CREATE TABLE EvaluationTopic (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    evaluationId INT,
    FOREIGN KEY (evaluationId) REFERENCES Evaluation(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indicator table (ต้องสร้างก่อน IndicatorLevel)
CREATE TABLE Indicator (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    topicId INT,
    evidenceDescription TEXT,
    indicatorType VARCHAR(50) NOT NULL,
    weight DECIMAL(10,2) DEFAULT 1.00,
    FOREIGN KEY (topicId) REFERENCES EvaluationTopic(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- IndicatorLevel table
CREATE TABLE IndicatorLevel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    level INT NOT NULL,
    indicatorId INT,
    FOREIGN KEY (indicatorId) REFERENCES Indicator(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- EvaluationAllocation table
CREATE TABLE EvaluationAllocation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluationId INT NOT NULL,
    evaluateeId INT NOT NULL,
    evaluatorId INT NOT NULL,
    evaluationComment TEXT,
    evaluatorRole VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    signatureData TEXT,
    signatureDate DATETIME DEFAULT NULL COMMENT 'วันที่ลงนาม',
    submittedAt DATETIME DEFAULT NULL COMMENT 'วันที่ส่งการประเมิน',
    FOREIGN KEY (evaluationId) REFERENCES Evaluation(id),
    FOREIGN KEY (evaluatorId) REFERENCES Employee(id),
    FOREIGN KEY (evaluateeId) REFERENCES Employee(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SelfIndicatorResult table
CREATE TABLE SelfIndicatorResult (
    id INT AUTO_INCREMENT PRIMARY KEY,
    allocationId INT,
    indicatorId INT,
    selectedLevelId INT,
    evidenceUrl VARCHAR(255) DEFAULT NULL,
    evidenceFilePath VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (allocationId) REFERENCES EvaluationAllocation(id),
    FOREIGN KEY (indicatorId) REFERENCES Indicator(id),
    FOREIGN KEY (selectedLevelId) REFERENCES IndicatorLevel(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- IndicatorResult table
CREATE TABLE IndicatorResult (
    id INT AUTO_INCREMENT PRIMARY KEY,
    allocationId INT,
    indicatorId INT,
    selectedLevelId INT,
    comment TEXT,
    FOREIGN KEY (allocationId) REFERENCES EvaluationAllocation(id),
    FOREIGN KEY (indicatorId) REFERENCES Indicator(id),
    FOREIGN KEY (selectedLevelId) REFERENCES IndicatorLevel(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;