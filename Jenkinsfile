pipeline{
    agent any
    environment{
        GOOGLE_CLOUD_PROJECT_ID='foodogram-translate'
        GOOGLE_CLOUD_API_KEY=credentials('GOOGLE_CLOUD_API_KEY')
        S3_BUCKET_NAME='foodogram-recipes'
        AWS_REGION='eu-north-1'
        AWS_ACCESS_KEY_ID=credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY=credentials('AWS_SECRET_ACCESS_KEY')
        DOCKER_APP_IMAGE= 'coderhub1/foodopia'
        DOCKER_DB_IMAGE = 'coderhub1/foodopia_db'
        SQL_ROOT_PASSWORD=credentials('MYSQL_ROOT_PASSWORD')
        SQL_USER_PASSWORD=credentials('MYSQL_USER_PASSWORD')
    }

    stages{
        stage('clone the repo'){
            steps{
                git branch: 'main', url: 'https://github.com/vinayakmurthy/foodopia-app.git'
            }
        }


        stage("build the app-image"){
            steps{
                withCredentials([file(credentialsId: 'GOOGLE_APPLICATION_CREDENTIALS', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]){
                    echo "google cred file is at: $GOOGLE_APPLICATION_CREDENTIALS"
                    sh "cp -f $GOOGLE_APPLICATION_CREDENTIALS ./Google_creds.json"
                    sh "docker build --no-cache -t ${DOCKER_APP_IMAGE}:V${BUILD_NUMBER} ."
                }
            }
        }
        stage('build the database image'){
            steps{
                sh """
                    docker build --no-cache -t $DOCKER_DB_IMAGE:V$BUILD_NUMBER ./database_mariadb/
                    """
            }
        }

        stage('Push the images to docker hubr'){
            steps{
                withCredentials([usernamePassword(credentialsId: 'dockercred', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASS')]){
                    sh """
                        docker login -u $DOCKER_USERNAME -p $DOCKER_PASS
                        docker push ${DOCKER_APP_IMAGE}:V${BUILD_NUMBER}
                        docker push ${DOCKER_DB_IMAGE}:V${BUILD_NUMBER}
                    """
                }
            }
        }
        
        /*stage('Create container using docker compose'){
            steps{
                sh "docker compose up -d"
            }
        }*/

        stage('Deploy to kubernetes'){ 
            agent {label 'kops'}
            steps{
                script{
                    sh """
                        helm --upgrade install foodopia-release ./foodopia-kube \
                        --namespace foodopia \
                        --set app.image=${DOCKER_APP_IMAGE} \
                        --set app.tag=V${BUILD_NUMBER} \
                        --set db.image=${DOCKER_DB_IMAGE}
                        --set db.tag=V${BUILD_NUMBER}
                    """
                }
            }
        }
    }
}