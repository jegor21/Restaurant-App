# Restaurant App
## Authors
- Jegor Skljar
- Erwin Šults

# ENG
## Little Description
This project was developed for educational purposes.
It is still in the ***testing phase*** and not ready for public release. Some features were not implemented in time, so certain aspects may not be optimized.

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
- Make sure your terminal path is in the `..\backend\` folder. If not, type the command `cd .\backend\` in the terminal.
- Then run ***npm install*** or ***npm i*** in the terminal to install node_modules.

### Frontend PART
1. Open a terminal for frontend.
2. For frontend part:
- Make sure your terminal path is in the `..\restaurant-app\` folder. If not, type the command `cd .\restaurant-app\` in the terminal.
- Then run ***npm install*** or ***npm i*** in the terminal to install node_modules
- If you get a list of errors while installing node_modules, run ***npm install --legacy-peer-deps***.

### Database
1. Open PhpMyAdmin via XAMPP.
2. Create a new database with any name.
3. Download the ***restaurant_app.sql*** file from this project and import it into the newly created database.
4. After importing, the database should generate tables and be ready for use. 

### .env PART
This file is very important for configuration and is required to connect to the API service, database, email, etc.  
Let’s explain what needs to be done for each line to make everything work properly.  
***Note: Both ends contain a `.env.example` file, which may already have default settings, such as database configuration. Wherever a variable starts with "Your_...", it means you need to insert your own secret values.***

#### Backend's .env

1. The first five lines are for the database (PhpMyAdmin). They already contain default settings such as `DB_HOST`, `DB_USER`, and `PORT`. The only one that may differ is `DB_NAME`, as you can name your database anything.

- Example configuration:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=restaurant_app
PORT=5000
```

2. Next is `JWT_SECRET`, which can be left as is.  
3. Then comes the email configuration. `EMAIL_HOST` and `EMAIL_PORT` stay unchanged, but everything else must be set manually. For detailed setup, you MUST follow this guide – https://support.google.com/mail/answer/185833?hl=en

- Example configuration:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=example@gmail.com
EMAIL_PASS=qwertyuiopasdfgh
EMAIL_FROM=example@gmail.com
```

Lastly, you need a Google Cloud API key. To get the key, you’ll need a Google account and a credit card (you won’t be able to use the API without one). Most importantly, after creating your account and linking everything, be sure to enable the following three services:
- Places API  
- Maps JavaScript API  
- Geocoding API  

Once the key is generated, just paste it into `GOOGLE_MAPS_API_KEY`.  
For detailed setup, you MUST follow this guide – https://developers.google.com/maps/get-started#api-key

#### Frontend's .env  
The frontend setup is much easier. If you’ve already generated the API key using the Google Cloud API instructions from the previous section, simply paste the same key into:  
`REACT_APP_GOOGLE_MAPS_API_KEY`

### Final steps
If you have installed node_modules for both backend and frontend, and imported the database, you are ready to launch the project.
1. Make sure the .env files are added in both ends. Each end contains a .env.example file showing the required variables.
2. Make sure the database is running.
3. For convenience, use two terminals — one for the backend and one for the frontend.

4. To start the backend, make sure you are in the `..\backend\` folder. If not, type `cd .\backend\`.
To launch it, type ***node server.js***.
ЕIf you see "Server is running on port 5000" in the terminal, the backend is fully operational.

5. To start the frontend, make sure you are in the `..\restaurant-app\` folder. If not, type `cd .\restaurant-app\`.
Then type ***npm start*** to launch it.
After that, the frontend will be ready.

6. If you've completed all the steps above, the project is ready to use!

Good luck!


# EST
## Väike kirjeldus  
See projekt on välja töötatud õppe eesmärkidel.  
See on endiselt ***testimise faasis*** ja ei ole avalikuks väljaandmiseks valmis. Mõned funktsioonid ei olnud õigeaegselt rakendatud, seetõttu võivad mõned aspektid olla optimeerimata.

## Funktsionaalsus  
See projekt sisaldab järgmisi funktsioone:
- Otsing Google Mapsi kaudu, kasutades Google Cloud API-d.
- REST API andmete vahetamiseks ja salvestamiseks.
- Sorteerimine hinnangute ja arvustuste põhjal nii kahanevas kui ka kasvavas järjekorras.
- Dünaamiline leht restoranide üksikasjade kuvamiseks.
- Visuaalne otsinguala ja kaardimärgid restoranide asukohtade visualiseerimiseks.
- Kasutajakonto loomine, et postitada kommentaare või kasutada restoranide otsimise põhifunktsioone piirkonnas.
- Administratiivsete õiguste rakendamine kommentaaride modereerimiseks ja muude ülesannete täitmiseks.

## Kuidas projekti üles tõsta  
### Veendu, et!
1. Veendu, et sul on Node.js paigaldatud oma seadmesse. Kui ei, siis laadi see alla ametlikult veebisaidilt.
2. Veendu, et sul on juurdepääs PhpMyAdminile. Kui ei, siis paigalda XAMPP ametlikult veebisaidilt.
3. Kloonige hoidla Visual Studio Code'i, kuna selle koodiredaktoriga on projektide käitamine lihtsam.
4. Ärge unustage lisada .env-faile nii backend- kui frontend (restaurant-app) kaustadesse, et funktsionaalsus töötaks. Igas kaustas on .env.example fail, mis näitab, millised muutujad peaksid olema .env failis.

### Backend OSAD
1. Ava terminal backend'i jaoks.
2. Backend'i jaoks:
- Veendu, et sinu terminali tee oleks kaustas `..\backend\`. Kui ei, siis sisesta terminali käsk `cd .\backend\`.
- Seejärel käivita ***npm install*** või ***npm i*** terminalis, et installida node_modules.

### Frontend OSAD
1. Ava terminal frontend'i jaoks.
2. Frontendi jaoks:
- Veendu, et sinu terminali tee oleks kaustas `..\restaurant-app\`. Kui ei, siis sisesta terminali käsk `cd .\restaurant-app\`.
- Seejärel käivita ***npm install*** või ***npm i*** terminalis, et installida node_modules.
- Kui saad node_modules installimise ajal vigade nimekirja, siis käivita ***npm install --legacy-peer-deps***.

### Andmebaas
1. Ava PhpMyAdmin XAMPP kaudu.
2. Loo uus andmebaas mõne nimega.
3. Laadi alla ***restaurant_app.sql*** fail sellelt projektilt ja impordi see uude loodud andmebaasi.
4. Pärast importimist peaks andmebaas looma tabelid ja olema valmis kasutamiseks.

### .env OSA  
See fail on konfiguratsiooni jaoks väga oluline ning vajalik API teenuse, andmebaasi, e-posti jms ühendamiseks.  
Selgitame, mida tuleb teha iga rea jaoks, et kõik korralikult töötaks.  
***Märkus: Mõlemas projektiosas on olemas `.env.example` fail, kus võivad juba olla vaikimisi seaded (näiteks andmebaasi seaded). Kui muutuja algab sõnaga "Your_...", tähendab see, et sinna tuleb lisada sinu enda salajased väärtused.***

#### Backend'i .env  

1. Esimesed viis rida on mõeldud andmebaasi jaoks (PhpMyAdmin). Seal on juba vaikimisi väärtused nagu `DB_HOST`, `DB_USER` ja `PORT`. Ainus, mis võib erineda, on `DB_NAME`, kuna andmebaasi nimi võib olla sinu enda valitud.

- Näide konfiguratsioonist:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=restaurant_app
PORT=5000
```

2. Järgmiseks on `JWT_SECRET`, mida võib jätta vaikimisi.  
3. Seejärel tuleb e-posti seadistus. `EMAIL_HOST` ja `EMAIL_PORT` jäävad muutmata, kuid kõik muu tuleb käsitsi seadistada. Täpsemaks seadistamiseks PEAB järgima seda juhendit – https://support.google.com/mail/answer/185833?hl=en

- Näide seadistusest:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=example@gmail.com
EMAIL_PASS=qwertyuiopasdfgh
EMAIL_FROM=example@gmail.com
```

Lõpuks on vaja Google Cloud API võtit. Võtme loomiseks on vaja Google’i kontot ja pangakaarti (ilma selleta ei saa API-t kasutada). Kõige tähtsam on, et pärast konto loomist ja kõige sidumist tuleb kindlasti aktiveerida järgmised kolm teenust:
- Places API  
- Maps JavaScript API  
- Geocoding API  

Kui võti on loodud, sisesta see lihtsalt muutujasse `GOOGLE_MAPS_API_KEY`.  
Täpsemaks seadistamiseks PEAB järgima seda juhendit – https://developers.google.com/maps/get-started#api-key

#### Frontend'i .env  
Frontend'i seadistamine on palju lihtsam. Kui oled juba loonud API võtme kasutades eelmises peatükis toodud Google Cloud API juhendit, siis sisesta sama võti siia:  
`REACT_APP_GOOGLE_MAPS_API_KEY`


### Lõppsammed
Kui oled paigaldanud node_modules nii backend'ile kui frontend'ile ja impordinud andmebaasi, siis oled valmis projekti üles tõstma.
1. Veendu, et .env failid on lisatud mõlemale poolele. Igas pooles on .env.example fail, mis näitab nõutavaid muutujaid.
2. Veendu, et andmebaas töötab.
3. Mugavuse huvides kasuta kahte terminali — ühte backend'i jaoks ja ühte frontend'i jaoks.

4. Backend'i käivitamiseks veendu, et oled kaustas `..\backend\`. Kui ei, siis sisesta `cd .\backend\`.
Käivita see käsuga ***node server.js***.
Kui näed terminalis "Server is running on port 5000", siis on backend täielikult töövalmis.

5. Frontendi käivitamiseks veendu, et oled kaustas `..\restaurant-app\`. Kui ei, siis sisesta `cd .\restaurant-app\`.
Seejärel sisesta ***npm start***, et seda käivitada.
Pärast seda on frontend valmis.

6. Kui oled lõpetanud kõik eelnevad sammud, on projekt kasutamiseks valmis!

Edu!
