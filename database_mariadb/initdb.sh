#!/bin/bash

# Generate and execute the SQL commands for user creation and granting privileges
cat <<EOF > /tmp/grant_prev.sql
CREATE USER IF NOT EXISTS 'vinayak'@'%' IDENTIFIED BY '$MYSQL_USER_PASSWORD';
GRANT ALL PRIVILEGES ON foodogram.* TO 'vinayak'@'%';

CREATE USER IF NOT EXISTS 'vinayak'@'localhost' IDENTIFIED BY '$MYSQL_USER_PASSWORD';
GRANT ALL PRIVILEGES ON foodogram.* TO 'vinayak'@'localhost';
FLUSH PRIVILEGES;
EOF

# Move the generated file to a writable init directory
mv /tmp/grant_prev.sql /var/lib/mysql/initdb.d/