# StayNest — Student Accommodation Website

StayNest is a student accommodation website built as a web development portfolio project. It helps students explore accommodation options and filter properties according to their preferences.

## Features

- Browse accommodation listings loaded from a MariaDB database.
- Filter properties by city, budget, and accommodation gender preference.
- View property details and amenities.
- Register and log in using secure password hashing.
- Add or remove properties from a personal shortlist.
- Switch between light and dark themes.
- Responsive interface with a React-powered results summary.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- PHP
- MariaDB
- React
- Vite
- Git and GitHub

## Local Setup

1. Clone this repository.
2. Install PHP and MariaDB.
3. Create a MariaDB database named `staynest`.
4. Configure your local database connection in `db.php`.
5. Create the required tables and populate the database with sample properties and amenities.
6. Install the React widget dependencies and build the widget from the `react-widget` directory.
7. Start the PHP development server from the project root:

   ```bash
   php -S 127.0.0.1:8000
   ```

8. Open `http://127.0.0.1:8000` in your browser.

**Note:** Database credentials, schema setup, and sample data must be configured locally. Do not commit database passwords or other secrets.

## Project Status

Portfolio project under development.
