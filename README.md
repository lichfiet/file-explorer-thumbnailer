# Template Express API

This project is a template for creating Express APIs. It is structured to facilitate the development of scalable and maintainable applications.

## Project Structure

The project is organized as follows:

- `src/`: Contains the main server code, utility functions, and middleware.
  - `middlewares/`: Contains middleware functions for logging and request validation.
  - `utils/`: Contains utility functions for database connection and other operations.
  - `server.js`: The main server file.
- `development/`: Contains Dockerfile and shell script for setting up the development environment.
- `package.json`: Contains the list of project dependencies and scripts.
- `Makefile`: Contains commands for initializing the development environment and building the production image.
- `.env` and `sample.env`: Environment configuration files.
- `.dockerignore` and `.gitignore`: Files specifying what to ignore when building Docker images and committing to Git respectively.

## How to Use This Template

1. Clone the repository.
2. Rename the `sample.env` to `.env` and customize the `.env` file with your environment variables.
3. Install the dependencies by running `npm install`.
4. Start the development server by running `npm run dev`.
5. Build the production Docker image by running the commands specified in the `Makefile`, run `make help` to see list of commands and descriptions.

This template is designed to be flexible and adaptable to various use cases. Feel free to modify and extend it to suit your needs.