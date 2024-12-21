#!/bin/bash

# Generate and execute the SQL commands for user creation and granting privileges
cat <<EOF > /tmp/grant_prev.sql
CREATE USER IF NOT EXISTS 'vinayak'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON foodogram.* TO 'vinayak'@'%';

CREATE USER IF NOT EXISTS 'vinayak'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON foodogram.* TO 'vinayak'@'localhost';
FLUSH PRIVILEGES;
EOF

# Execute the SQL file using the MariaDB client
mysql -u root -p"$MYSQL_ROOT_PASSWORD" < /tmp/grant_prev.sql

# Clean up (Optional)
rm -f /tmp/grant_prev.sql