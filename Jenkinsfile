pipeline{
    agent any

    tools
        {  
            jdk "JDK11"
        }

    environment{
        DOCKER_APP_IMAGE= 'coderhub1/foodopia'
        DOCKER_DB_IMAGE = 'coderhub1/foodopia_db'
        scannerHome = tool 'sonarscanner'
    }

    stages{
        stage('clone the repo'){
            steps{
                git branch: 'main', url: 'https://github.com/vinayakmurthy/foodopia-app.git'
            }
        }
        
        stage('sonarscanner for backend') {
            steps{
                script{
                    dir('foodogram-backend') {
                        withSonarQubeEnv('sonar'){
                            sh """
                                ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=foodopia-backend \
                                -Dsonar.projectName=foodopia-app-back \
                                -Dsonar.projectVersion=1.0 \
                                -Dsonar.sources=. \
                            """        
                        } 
                    }      

                }
                
            }
        }

        stage('sonarscanner for frontend'){
            steps{
                script{
                    dir('foodogram-frontend'){
                        withSonarQubeEnv('sonar'){
                            sh """
                                ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=foodogram-frontend \
                                -Dsonar.projectName=foodopia-app-front \
                                -Dsonar.ProjectVersion=1.0 \
                                -Dsonar.sources=src \
                            
                            """
                        }
                           
                    }

                }
            }
        }
        stage('quality gates'){
            steps{
                timeout(time:1, unit:'HOURS'){
                    waitForQualityGate abortPipeline: True
                }
            }
        }


        /*stage("build the app-image"){
            steps{
                withCredentials([file(credentialsId: 'GOOGLE_APPLICATION_CREDENTIALS', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]){
                    echo "google cred file is at: $GOOGLE_APPLICATION_CREDENTIALS"
                    sh "cp -f $GOOGLE_APPLICATION_CREDENTIALS ./Google_creds.json"
                    sh "docker build --no-cache -t ${DOCKER_APP_IMAGE}:${BUILD_NUMBER} ."
                }
            }
        }
        stage('build the database image'){
            steps{
                sh """
                    docker build -t $DOCKER_DB_IMAGE:$BUILD_NUMBER ./database_mariadb/
                    """
            }
        }

        stage('Push the images to docker hub'){
            steps{
                withCredentials([usernamePassword(credentialsId: 'dockercred', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASS')]){
                    sh """
                        docker login -u $DOCKER_USERNAME -p $DOCKER_PASS
                        docker push ${DOCKER_APP_IMAGE}:${BUILD_NUMBER}
                        docker push ${DOCKER_DB_IMAGE}:${BUILD_NUMBER}
                    """
                }
            }
        }
        
        stage('Create container using docker compose'){
            steps{
                sh "docker compose up -d"
            }
        }

        stage('Deploy to kubernetes'){ 
            agent {label 'kops'}
            steps{
                script{
                    sh """
                        helm upgrade --install foodopia-release ./foodopia-kube \
                        --namespace foodopia \
                        --set app.image=${DOCKER_APP_IMAGE} \
                        --set app.tag=${BUILD_NUMBER} \
                        --set db.image=${DOCKER_DB_IMAGE} \
                        --set db.tag=${BUILD_NUMBER}
                    """
                }
            }
        }*/
    }
}