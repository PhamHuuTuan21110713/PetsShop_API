# Pet shop server

This is a server built with Node.js, Express.js, MongoDB, and JWT for authentication.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them:

- Node.js
- MongoDB
- yarn

### Installing

A step by step series of examples that tell you how to get a development environment running:

1. Clone the repository to your local machine using `git clone <repository_link>`.
2. Navigate to the project directory using `cd <project_directory>`.
3. Install the dependencies using `yarn install`.
4. Start the MongoDB service.
5. Create a `.env` file in the root directory and set up your environment variables:
    MONGO_URI,
    CLOUDINARY_NAME,
    CLOUDINARY_KEY,
    CLOUDINARY_SECRET,
    ACCESS_TOKEN,
    REFRESH_TOKEN,
    MY_EMAIL,
    MY_EMAIL_PASSWORD
7. Start the server using `yarn start`.

## Running the tests

Explain how to run the automated tests for this system:

- Run `yarn test`.

## Built With

- [Node.js](https://nodejs.org/) - The runtime environment
- [Express.js](https://expressjs.com/) - The web application framework
- [MongoDB](https://www.mongodb.com/) - The database used
- [JWT](https://jwt.io/) - Used for authentication
