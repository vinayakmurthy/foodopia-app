#stage-1 genrate the build folder
FROM node:22.11.0 AS frontend-build
WORKDIR /foodopia/foodogram-frontend

#copy the foodogram-frontend package-json and package-lock.json and install all the dependencies
COPY ./foodogram-frontend/package-lock.json ./foodogram-frontend/package.json ./

#install the dependencies
RUN npm install

#now the dependencies are installed now copy the whole foodogram-frontend folder into the /foodopia/foodogram-frontend
COPY ./foodogram-frontend/. ./

#let me run ls command so that i know what is inside the /foodopia/foodogram-frontend/
RUN ls -la ./

#inorder to generate the production build we need run below command that generate the build folder which has all the necessary static files
RUN npm run build

#once we have ran the build command lets see that build folder is generate or not
RUN ls -la /foodopia/foodogram-frontend/
############################################################################################################

#stage-2 copy the build folder to foodogram-backend
FROM node:22.11.0
WORKDIR /foodopia/foodogram-backend

#set enviornment variables required for backend 
ARG S3_BUCKET_NAME
ARG AWS_REGION
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG GOOGLE_CLOUD_PROJECT_ID
ARG GOOGLE_CLOUD_API_KEY
ARG GOOGLE_APPLICATION_CREDENTIALS

ENV S3_BUCKET_NAME=${S3_BUCKET_NAME}
ENV AWS_REGION=${AWS_REGION}
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV GOOGLE_CLOUD_PROJECT_ID=${GOOGLE_CLOUD_PROJECT_ID}
ENV GOOGLE_CLOUD_API_KEY=${GOOGLE_CLOUD_API_KEY}

#Copy the foodogram-transalte json file to the /foodopia/foodogram-backend/config
COPY ${GOOGLE_APPLICATION_CREDENTIALS} /foodopia/foodogram-backend/config/foodogram-translate-credentials.json

#set the GOOGLE_APPLICATION_CREDENTIALS env
ENV GOOGLE_APPLICATION_CREDENTIALS=../foodogram-backend/config/foodogram-translate-3d477959314e.json

#copy the foodogram-backend package-json and package-lock.json and install all the dependencies
COPY ./foodogram-backend/package-lock.json ./foodogram-backend/package.json ./

#install the backend dependencies
RUN npm install

#copy the thw whole foodogram-backend folder to /foodopia/foodogram-backend
COPY ./foodogram-backend/. ./

#run ls command to see what is inside the /foodopia/foodogram-backend ==> just to know the things are getting copied
RUN ls -la ./

#now copy the build folder that we generated in first stage to /foodopia/foodogram-backend
COPY --from=frontend-build /foodopia/foodogram-frontend/build/. /foodopia/foodogram-backend/build

#Now run the index.js
CMD [ "node", "./index.js" ]