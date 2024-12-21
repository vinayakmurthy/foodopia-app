FROM mariadb:10.5.22

ARG MYSQL_ROOT_PASSWORD
ARG MYSQL_USER_PASSWORD
#set the enviorment variables
ENV MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
ENV MYSQL_DATABASE=foodogram
ENV MYSQL_USER=vinayak
ENV MYSQL_PASSWORD=${MYSQL_USER_PASSWORD}

#inject the .sql file to the mariadb
COPY ./foodogram_backup.sql /docker-entrypoint-initdb.d/

#run the initdb.sh
COPY ./initdb.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/initdb.sh

#Expose to port 3306
EXPOSE 3306

## This image will start MariaDB by default
CMD ["mysqld"]