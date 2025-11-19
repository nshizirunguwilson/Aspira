CREATE TABLE If Not Exists citizen (
    citizenId INT PRIMARY KEY AUTO_INCREMENT,
    fullName VARCHAR(255),
    phoneNumber VARCHAR(255),
    idNumber VARCHAR(255),
    password VARCHAR(255),
    address VARCHAR(255)
)

CREATE TABLE If Not Exists services (
    serviceId INT PRIMARY KEY AUTO_INCREMENT,
    serviceName VARCHAR(255)
)

CREATE TABLE If Not Exists feedback (
    feedbackId INT PRIMARY KEY AUTO_INCREMENT,
    citizenId INT,
    serviceId INT,
    feedback VARCHAR(255),
    location VARCHAR(255),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    frequency INT,
    upVotes INT,
    status VARCHAR(255) DEFAULT 'pending', -- 'in progress', 'solved', 'cancelled'
    FOREIGN KEY (citizenId) REFERENCES citizen(citizenId),
    FOREIGN KEY (serviceId) REFERENCES services(serviceId)
)

CREATE TABLE If Not Exists comments (
    commentId INT PRIMARY KEY AUTO_INCREMENT,
    feedbackId INT,
    comment VARCHAR(255),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedbackId) REFERENCES feedback(feedbackId)
)

CREATE TABLE If Not Exists admin (
    adminId INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255),
    password VARCHAR(255)
)
