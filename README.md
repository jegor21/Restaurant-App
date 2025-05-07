# Restaurant App
## Authors
-Jegor Skljar
-Erwin Šults

## Little Вescription
This project was developed for educational purposes.
It is still in the **testing phase** and not ready for public release. Some features were not implemented in time, so certain aspects may not be optimized.

## Functionality
This project includes the following features:
- Search via Google Maps using Google Cloud API.
- REST API for data exchange and storage.
- Sorting based on ratings and reviews in both descending and ascending order.
- Dynamic page for displaying restaurant details.
- Visual search area and map markers to visualize restaurant locations.
- User account creation to post comments or use core features for restaurant search in the area.
- Implementation of administrative privileges for comment moderation and other tasks.


## How to raise the project
### Make sure!
1. Make sure you have Node.js installed on your device. If not, download it from the official website.
2. Make sure you have access to PhpMyAdmin. If not, install XAMPP from the official website.
3. Clone the repository in Visual Studio Code, as it's easier to run the project using this code editor.
4. Don't forget to add .env files in both the backend and frontend(restaurant-app) folders to make the functionality work. Each folder contains a .env.example file that shows what variables should be included in .env file.

### Backend PART
1. Open a terminal for the backend.
2. For backend part:
2.1 Make sure your terminal path is in the **..\backend\** folder. If not, type the command **cd .\backend\** in the terminal.
2.2 Then run **npm install** or **npm i** in the terminal to install node_modules.

### Frontend PART
1. Open a terminal for frontend.
2. For frontend part:
2.1 Make sure your terminal path is in the **..\restaurant-app\** folder. If not, type the command **cd .\restaurant-app\** in the terminal.
2.2 Then run **npm install** or **npm i** in the terminal to install node_modules
2.3 If you get a list of errors while installing node_modules, run **npm install --legacy-peer-deps**.

### Database
1. Open PhpMyAdmin via XAMPP.
2. Create a new database with any name.
3. Download the **restaurant_app.sql** file from this project and import it into the newly created database.
4. After importing, the database should generate tables and be ready for use. 

### Final steps
If you have installed node_modules for both backend and frontend, and imported the database, you are ready to launch the project.
1. Make sure the .env files are added in both ends. Each end contains a .env.example file showing the required variables.
2. Make sure the database is running.
3. For convenience, use two terminals — one for the backend and one for the frontend.

4. To start the backend, make sure you are in the **..\backend\** folder. If not, type **cd .\backend\**.
To launch it, type **node server.js**.
ЕIf you see "Server is running on port 5000" in the terminal, the backend is fully operational.

5. To start the frontend, make sure you are in the **..\restaurant-app\** folder. If not, type **cd .\restaurant-app\**
Then type **npm start** to launch it.
After that, the frontend will be ready.

6. If you've completed all the steps above, the project is ready to use!

Good luck!