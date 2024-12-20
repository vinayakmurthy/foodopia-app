FROM mariadb:10.5.22

ARG MYSQL_PASSWORD
#set the enviorment variables
ENV MYSQL_ROOT_PASSWORD=admin123
ENV MYSQL_DATABASE=foodogram
ENV MYSQL_USER=vinayak
ENV MYSQL_PASSWORD=${MYSQL_PASSWORD}

#inject the .sql file to the mariadb
COPY database_mariadb/foodogram_backup.sql /docker-entrypoint-initdb.d/
COPY /var/lib/jenkins/workspace/foodopia_CICD/database_mariadb/grant_prev.sql /docker-entrypoint-initdb.d/

#Expose to port 3306
EXPOSE 3306

## This image will start MariaDB by default
CMD ["mysqld"]