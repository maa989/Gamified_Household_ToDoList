# Gamified_Household_ToDoList

##Description
This project is a web application for managing household tasks. It provides a centralized platform for managing tasks, assigning them to household members, setting deadlines, and tracking progress. The application also provides notifications and reminders to ensure that tasks are completed on time.

##Installation
To install this application, follow these steps:

Clone the repository to your local machine.
Navigate to the project directory.
Run npm install to install the required dependencies.
Usage
To start the application, run npm start. This will start the Node.js server and launch the application.

Once the application is running, you can access it in your web browser by navigating to http://localhost:3000. From there, you can create and manage household tasks.

##Files
The following is a list of the major files in this repository:

app.js: This is the main Node.js application file. It defines the routes and middleware for the application.
package.json: This file contains the project's dependencies and other metadata.
public/: This directory contains the static files (e.g., CSS, JavaScript, images) for the application.
views/: This directory contains the EJS templates for the application.

##Configuration
This application requires a few configuration variables to be set in order to work properly:

DATABASE_URL: The URL for the MongoDB database used by the application.
SESSION_SECRET: A secret key used for encrypting session data.
PORT: The port number that the Node.js server should listen on.
