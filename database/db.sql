CREATE DATABASE trading_bot;

USE trading_bot;

CREATE TABLE user(
    id VARCHAR(35) NOT NULL,
    start_balance VARCHAR(10) NOT NULL,
    available_money VARCHAR(20) NOT NULL,
    actual_balance VARCHAR(20) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE wallet(
    id INT NOT NULL AUTO_INCREMENT,
    amount VARCHAR(10) NOT NULL,
    crypto VARCHAR(10) NOT NULL,
    userID VARCHAR(35) NOT NULL,
    total_money VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (userID) REFERENCES user(id) ON DELETE CASCADE
)AUTO_INCREMENT=1;

CREATE TABLE historical(
    id INT NOT NULL AUTO_INCREMENT,
    amount VARCHAR(10) NOT NULL,
    crypto VARCHAR(10) NOT NULL,
    price VARCHAR(25) NOT NULL,
    total_amount VARCHAR(25) NOT NULL,
    order_type VARCHAR(4) NOT NULL,
    idWallet INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (idWallet) REFERENCES wallet(id) ON DELETE CASCADE
)AUTO_INCREMENT=1;

