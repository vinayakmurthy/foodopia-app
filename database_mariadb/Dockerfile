FROM mariadb:10.5.22

ARG MYSQL_PASSWORD
#set the enviorment variables
ENV MYSQL_ROOT_PASSWORD=${MYSQL_PASSWORD}
ENV MYSQL_DATABASE=foodogram

# Install gettext package to provide envsubst
RUN apt-get update && apt-get install -y gettext

#inject the .sql file to the mariadb
COPY ./foodogram_backup.sql /docker-entrypoint-initdb.d/
COPY ./grant_prev.sql /docker-entrypoint-initdb.d/

#Expose to port 3306
EXPOSE 3306

## This image will start MariaDB by default
CMD ["mysqld"]