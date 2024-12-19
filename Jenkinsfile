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
            git branch: 'main', url: 'https://github.com/vinayakmurthy/foodopia-app.git'
        }
    }
}