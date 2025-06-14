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

#Copy the foodogram-transalte json file to the /foodopia/foodogram-backend/config
COPY ./Google_creds.json /foodopia/foodogram-backend/config/foodogram-translate-3d477959314e.json

#set the GOOGLE_APPLICATION_CREDENTIALS env
ENV GOOGLE_APPLICATION_CREDENTIALS=../foodogram-backend/config/foodogram-translate-3d477959314e.json

#copy the foodogram-backend package-json and package-lock.json and install all the dependencies
COPY ./foodogram-backend/package-lock.json ./foodogram-backend/package.json ./

#install the backend dependencies
RUN npm install
RUN npm install aws-sdk multer --save

#copy the thw whole foodogram-backend folder to /foodopia/foodogram-backend
COPY ./foodogram-backend/. ./

#run ls command to see what is inside the /foodopia/foodogram-backend ==> just to know the things are getting copied
RUN ls -la ./

#now copy the build folder that we generated in first stage to /foodopia/foodogram-backend
COPY --from=frontend-build /foodopia/foodogram-frontend/build/. /foodopia/foodogram-backend/build

#expose the image to 80
EXPOSE 80

#Now run the index.js
CMD [ "node", "./index.js" ]