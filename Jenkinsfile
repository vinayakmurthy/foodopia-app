pipeline{
    agent any

    environment{
        DOCKER_APP_IMAGE= 'coderhub1/foodopia'
        DOCKER_DB_IMAGE = 'coderhub1/foodopia_db'
        scannerHome = tool 'sonarscanner'
        SLACK_CHANNEL = '#foodopia-cicd'
    }

    stages{
        stage('clone the repo'){
            steps{
                script{
                    try{
                        git branch: 'main', url: 'https://github.com/vinayakmurthy/foodopia-app.git'
                        slackSend(channel: SLACK_CHANNEL, message: "Stage: Clone Repo completed successfully :white_check_mark:")
                    } catch (e) {
                        slackSend(channel: SLACK_CHANNEL, message: "Stage: Clone Repo failed :x: Error: ${e.message}")
                    }
                }
                
            }
        }
        
        stage('sonarscanner for backend') {
            tools {
                jdk "JDK11"
            }
            steps{
                script{
                    try{
                        dir('foodogram-backend') {
                            withSonarQubeEnv('sonar'){
                                sh """
                                    ${scannerHome}/bin/sonar-scanner \
                                    -Dsonar.projectKey=foodopia-backend \
                                    -Dsonar.projectName=foodopia-app-back \
                                    -Dsonar.projectVersion=1.0 \
                                    -Dsonar.sources=. \
                                    -Dsonar.qualitygate=foodopia-qg
                                """        
                            } 
                        }
                        slackSend(channel: SLACK_CHANNEL, message: "Stage: SonarScanner for Backend completed successfully :white_check_mark:")     
                    } catch (e){
                        slackSend(channel: SLACK_CHANNEL, message: "Stage: SonarScanner for Backend failed :x: Error: ${e.message}:")
                    }
                } 
            }
        }

        stage('sonarscanner for frontend'){
            tools{
                jdk "JDK11"
            }
            steps{
                script{
                    try{
                        dir('foodogram-frontend'){
                            withSonarQubeEnv('sonar'){
                                sh """
                                    ${scannerHome}/bin/sonar-scanner \
                                    -Dsonar.projectKey=foodogram-frontend \
                                    -Dsonar.projectName=foodopia-app-front \
                                    -Dsonar.ProjectVersion=1.0 \
                                    -Dsonar.sources=src \
                                    -Dsonar.qualitygate=foodopia-qg
                                """
                            }  
                        }
                        slackSend(channel: SLACK_CHANNEL, message: "Stage: SonarScanner for frontend completed successfully :white_check_mark:")
                    } catch (e) {
                        slackSend(channel: SLACK_CHANNEL, message: "Stage: SonarScanner for frontend failed :x: Error: ${e.message}:")
                    }
                }
            }
        }
        stage('quality gates'){
            steps{
                script{
                    try{
                        timeout(time:1, unit:'HOURS'){
                        waitForQualityGate abortPipeline: true
                        }
                    slackSend(channel: SLACK_CHANNEL, message: "Stage: Quality Gates passed successfully :white_check_mark:")    
                    } catch (e){
                        slackSend(channel: SLACK_CHANNEL, message: "Stage: Quality Gates failed :x: Error: ${e.message}")
                    }
                }
            }
        }

        stage("build app-image"){
            steps{
                script{
                    withCredentials([file(credentialsId: 'GOOGLE_APPLICATION_CREDENTIALS', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]){
                        try{
                            echo "google cred file is at: $GOOGLE_APPLICATION_CREDENTIALS"
                            sh "cp -f $GOOGLE_APPLICATION_CREDENTIALS ./Google_creds.json"
                            sh "docker build --no-cache -t ${DOCKER_APP_IMAGE}:${BUILD_NUMBER} ."
                            slackSend(channel: SLACK_CHANNEL, message: "Stage: build app-image passed successfully :white_checkmark:")
                        } catch (e){
                            slackSend(channel: SLACK_CHANNEL, message: "Stage: build app-image failed :x: Error: ${e.message}")
                        }
                    }
                }

            }
        }
        stage('build the database-image'){
            steps{
                script{
                    try{
                        sh """
                        docker build -t $DOCKER_DB_IMAGE:$BUILD_NUMBER ./database_mariadb/
                        """
                        slackSend(channel: SLACK_CHANNEL, message: "Stage: build database-image passed successfully :white_checkmark:")
                    } catch (e){
                        slackSend(channel: SLACK_CHANNEL, message: "Stage: build database-image failed :x: Error: ${e.message}")
                    }
                }
            }
        }

        stage('Push the images to docker hub'){
            steps{
                script{
                    withCredentials([usernamePassword(credentialsId: 'dockercred', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASS')]){
                        try{
                            sh """
                            docker login -u $DOCKER_USERNAME -p $DOCKER_PASS
                            docker push ${DOCKER_APP_IMAGE}:${BUILD_NUMBER}
                            docker push ${DOCKER_DB_IMAGE}:${BUILD_NUMBER}
                            """
                            slackSend(channel: SLACK_CHANNEL, message: "Stage: Push the images to docker hub passed successfully :white_checkmark:")
                        } catch (e){
                        slackSend(channel: SLACK_CHANNEL, message: "Stage: Push the images to docker hub failed :x: Error: ${e.message}")
                        }
                    }
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
                    try{
                        sh """
                        helm upgrade --install foodopia-release ./foodopia-kube \
                        --namespace foodopia \
                        --set app.image=${DOCKER_APP_IMAGE} \
                        --set app.tag=${BUILD_NUMBER} \
                        --set db.image=${DOCKER_DB_IMAGE} \
                        --set db.tag=${BUILD_NUMBER}
                    """
                    slackSend(channel: SLACK_CHANNEL, message: "Stage: Deploy to kubernetes passed successfully :white_checkmark:")
                    } catch (e){
                        slackSend(channel: SLACK_CHANNEL, message: "Stage: Deploy to kubernetes failed :x: Error: ${e.message}")
                    }
                }
            }
        }
        post {
            success {
                slackSend(channel: SLACK_CHANNEL, message: "Pipeline completed successfully :tada:")
            }
            failure {
                slackSend(channel: SLACK_CHANNEL, message: "Pipeline failed :x: Check logs for details.")
            }
        }
    }
}