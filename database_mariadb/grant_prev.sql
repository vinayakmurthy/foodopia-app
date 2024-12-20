
CREATE USER IF NOT EXISTS 'vinayak'@'%';
GRANT ALL PRIVILEGES ON foodogram.* TO 'vinayak'@'%';
GRANT ALL PRIVILEGES ON foodogram.* TO 'vinayak'@'localhost';
FLUSH PRIVILEGES;