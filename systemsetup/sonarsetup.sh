#!/bin/bash

# Backup the current sysctl settings in case we need to restore them later
cp /etc/sysctl.conf /root/sysctl.conf_backup

# Change some system settings to make sure SonarQube runs smoothly
cat <<EOT> /etc/sysctl.conf
vm.max_map_count=262144  # Increase the number of memory maps (important for large programs like SonarQube)
fs.file-max=65536        # Allow the system to handle more open files at once
ulimit -n 65536          # Allow the system to open more files
ulimit -u 4096           # Allow the system to run more processes at once
EOT

# Backup the limits file for system settings just in case we need it later
cp /etc/security/limits.conf /root/sec_limit.conf_backup

# Set limits for the 'sonarqube' user to allow it to open more files and run more processes
cat <<EOT> /etc/security/limits.conf
sonarqube   -   nofile   65536  # SonarQube user can open up to 65,536 files
sonarqube   -   nproc    409    # SonarQube user can run up to 409 processes
EOT

# Update the system's list of available software
sudo apt-get update -y

# Install Java 11, which SonarQube needs to run
sudo apt-get install openjdk-11-jdk -y

# Set Java 11 as the default version if there are multiple versions
sudo update-alternatives --config java

# Check the installed Java version to make sure it worked
java -version

# Update the package list again to add PostgreSQL sources
sudo apt update

# Download the key needed to install PostgreSQL
wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | sudo apt-key add -

# Add PostgreSQL's software source to the system's list of software
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'

# Install PostgreSQL and its additional utilities
sudo apt install postgresql postgresql-contrib -y

# Enable PostgreSQL to start automatically whenever the server starts
sudo systemctl enable postgresql.service

# Start the PostgreSQL database service
sudo systemctl start  postgresql.service

# Set a password for the 'postgres' user to make it easier to log in
sudo echo "postgres:admin123" | chpasswd

# Create a new PostgreSQL user called 'sonar' (this user will be used by SonarQube)
runuser -l postgres -c "createuser sonar"

# Set a password for the 'sonar' user
sudo -i -u postgres psql -c "ALTER USER sonar WITH ENCRYPTED PASSWORD 'admin123';"

# Create a PostgreSQL database called 'sonarqube' for storing SonarQube data
sudo -i -u postgres psql -c "CREATE DATABASE sonarqube OWNER sonar;"

# Give the 'sonar' user full access to the 'sonarqube' database
sudo -i -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sonarqube to sonar;"

# Restart PostgreSQL to make sure everything is set up correctly
systemctl restart  postgresql

# Check PostgreSQL service to make sure it's running and listening for connections
netstat -tulpena | grep postgres

# Create a directory where SonarQube will be installed
sudo mkdir -p /sonarqube/

# Change to the SonarQube installation directory
cd /sonarqube/

# Download the SonarQube zip file from the official source
sudo curl -O https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-8.3.0.34182.zip

# Install 'zip' to help with extracting the SonarQube file
sudo apt-get install zip -y

# Extract the SonarQube files to the /opt/ directory
sudo unzip -o sonarqube-8.3.0.34182.zip -d /opt/

# Rename the extracted folder to a simpler name
sudo mv /opt/sonarqube-8.3.0.34182/ /opt/sonarqube

# Create a new user group called 'sonar'
sudo groupadd sonar

# Create a new user called 'sonar' to run SonarQube
sudo useradd -c "SonarQube - User" -d /opt/sonarqube/ -g sonar sonar

# Change the ownership of the SonarQube directory to the 'sonar' user and group
sudo chown sonar:sonar /opt/sonarqube/ -R

# Backup the default SonarQube configuration file in case we need to restore it
cp /opt/sonarqube/conf/sonar.properties /root/sonar.properties_backup

# Configure SonarQube to use the 'sonar' PostgreSQL user and database
cat <<EOT> /opt/sonarqube/conf/sonar.properties
sonar.jdbc.username=sonar               # PostgreSQL username for SonarQube
sonar.jdbc.password=admin123            # Password for the 'sonar' PostgreSQL user
sonar.jdbc.url=jdbc:postgresql://localhost/sonarqube  # PostgreSQL database URL
sonar.web.host=0.0.0.0                 # Make SonarQube available on all network interfaces
sonar.web.port=9000                     # Use port 9000 for the web interface
sonar.web.javaAdditionalOpts=-server   # Extra JVM options for SonarQube web server
sonar.search.javaOpts=-Xmx512m -Xms512m -XX:+HeapDumpOnOutOfMemoryError  # Memory settings for SonarQube search
sonar.log.level=INFO                   # Set log level to 'INFO' for general info logging
sonar.path.logs=logs                   # Set where SonarQube will store its logs
EOT

# Create a systemd service to make SonarQube run as a service (background process)
cat <<EOT> /etc/systemd/system/sonarqube.service
[Unit]
Description=SonarQube service
After=syslog.target network.target

[Service]
Type=forking
ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start    # Command to start SonarQube
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop      # Command to stop SonarQube

User=sonar                        # Run SonarQube as the 'sonar' user
Group=sonar                       # Run SonarQube as the 'sonar' group
Restart=always                    # Restart SonarQube if it crashes

LimitNOFILE=65536                 # Set the maximum number of files SonarQube can open
LimitNPROC=4096                   # Set the maximum number of processes SonarQube can create

[Install]
WantedBy=multi-user.target        # Make SonarQube start automatically on boot
EOT

# Reload systemd so it knows about the new SonarQube service
systemctl daemon-reload

# Enable SonarQube to start on boot automatically
systemctl enable sonarqube.service

# Start SonarQube now
systemctl start sonarqube.service

# Allow traffic on port 9000 (where SonarQube web interface runs)
sudo ufw allow 9000/tcp

# Let the user know that SonarQube is now available
echo "SonarQube is now available at http://16.171.8.27:9000"
