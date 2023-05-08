# Gamified_Household_ToDoList

## Description
This project is a web application for managing household tasks. It provides a centralized platform for managing tasks, assigning them to household members, setting deadlines, and tracking progress. The application also provides notifications and reminders to ensure that tasks are completed on time and also provides a point based reward system.

## Installation
To install this application, follow these steps:

1- Clone the repository to your local machine.

2-Navigate to the project directory.

3- Run npm install to install the required dependencies from the package.json file.

## Usage
To start the application, simply run "node project.js" in your terminal. This will start the Node.js server and launch the application.

Once the application is running, you can access it in your web browser by navigating to http://localhost:3000. From there, you can create and manage household tasks.

## Files
The following is a list of the major files in this repository:

project.js: This is the main Node.js application file. It defines the routes and middleware for the application.

package.json: This file contains the project's dependencies.

public/: This directory contains the static files (e.g., CSS, JavaScript, images) for the application.

views/: This directory contains the EJS templates for the application.

postman/: This directory contains the organized postman API collections used to test the APIs

mongoDB/: This directory contains a copy of the backend collections used.

## Configuration
This application requires a few configuration variables to be set in order to work properly:

database config (This can be edited in the householdToDoList class constructor):

this.config = {
            "host": "127.0.0.1",
            "port": "27017",
            "db": "householdToDoList",
            "opts": {
                "useUnifiedTopology": true
            }
        };

port: The port number that the Node.js server should listen on, default is 3000.
