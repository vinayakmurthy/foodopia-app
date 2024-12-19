pipeline{
    agent any
    environment{
        GOOGLE_CLOUD_PROJECT_ID='foodogram-translate'
        GOOGLE_CLOUD_API_KEY='AIzaSyCkRng5Z9RxCrJc4B7xfjF682Q5vNyFkHQ'

        S3_BUCKET_NAME='foodogram-recipes'
        AWS_REGION='eu-north-1'
        AWS_ACCESS_KEY_ID=credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY=credentials('AWS_SECRET_ACCESS_KEY')
    }

    stages{
        stage('clone the repo'){
            steps{
                git branch: 'main', url: 'https://github.com/vinayakmurthy/foodopia-app.git'
            }
        }

        stage("build the docker image"){
            steps{
                withCredentials([file(credentialsId: 'GOOGLE_APPLICATION_CREDENTIALS', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]){
                    echo "google cred file is at: $GOOGLE_APPLICATION_CREDENTIALS"
                    sh "docker build -t foodopia-image:$BUILD_NUMBER ."
                }
            }
        }
    }
}