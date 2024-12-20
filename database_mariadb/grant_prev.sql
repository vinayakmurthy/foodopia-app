
CREATE USER IF NOT EXISTS 'vinayak'@'%';
GRANT ALL PRIVILEGES ON foodogram.* TO 'vinayak'@'%';

CREATE USER IF NOT EXISTS 'vinayak'@'localhost';
GRANT ALL PRIVILEGES ON foodogram.* TO 'vinayak'@'localhost';
FLUSH PRIVILEGES;