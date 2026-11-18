# Liftly - Social Plattform för Gym & Hälsa

*Liftly* är en modern social plattform utvecklad för personer med intresse för gym och hälsa. Projektet startade ursprungligen som ett examensarbete för Glimåkra Folkhögskola, men drivs och utvecklas nu vidare som ett självständigt, fullt fungerande live-projekt i produktion. 

Användare kan skapa konton, dela och redigera inlägg (inklusive träningskalendrar och media), kommentera och gilla andras innehåll samt spara inlägg för senare användning. Plattformen täcker ämnen som träning, kost, recept och hälsa, och skapar en interaktiv community för inspiration och kunskapsdelning.

## Krav

### Frontend
#### Användare
1. Ska kunna skapa en användare 
2. Ska kunna logga in med sin skapade användare
3. Ska kunna logga ut med sin skapade användare
4. Ska kunna skapa egna inlägg med text
5. Ska kunna skapa egna inlägg med bild
6. Ska kunna skapa egna inlägg med video
7. Ska kunna dela sin månatliga träningskalender direkt till flödet
8. Ska kunna redigera egna inlägg
9. Ska kunna radera egna inlägg
10. Ska kunna se andra användares inlägg
11. Ska kunna spara andra användares inlägg för att kolla på senare
12. Ska kunna besöka en annan användares profil 
13. Ska ha en egen profil sida
14. Ska kunna lägga till hashtags på sina egna inlägg
15. Ska kunna gilla andra användares inlägg
16. Ska kunna kommentera på andra användares inlägg
17. Ska kunna gilla andra användares kommentarer
18. Ska kunna söka efter användare och inlägg
19. Ska kunna filtrera inlägg efter kategori
20. Ska kunna sortera sparade inlägg efter kategorier
21. Ska kunna följa andra användare
22. Ska kunna återställa glömt lösenord
23. Ska kunna se och hantera sina notiser i en notis-modal (med filter för Allt, Likes, Kommentarer och Följningar)
24. Ska få realtidsnotiser via Socket.io när andra användare gillar, kommenterar eller följer


#### Besökare
1. Ska kunna se alla inlägg på hemsidan

### Backend
#### Databas
1. Spara användare (`userModel.js`): användarnamn, email, lösenord, profilbild, profil bio, följare, användare man följer, sparade inlägg
2. Spara inlägg (`postModel.js`): text, bild, datum, likes, kommentarer, skapad av user_id, post_id, calendarShare (månadsöversikt)
3. Spara kommentarer (`commentModel.js`): text, likes, skapad av user_id, datum, kopplat till inlägg, svar (replies)
4. Spara notiser (`notificationModel.js`): mottagare, avsändare, typ (like, comment, reply, follow), relaterat inlägg, läst-status
5. Spara träningspass (`workoutModel.js`): övningar, set, reps, vikt och koppling till användare
6. Spara kalendrar (`calendarModel.js`): träningsdagar, händelser och planering per månad
7. Spara matloggar (`foodLogModel.js`): kostintag, måltider och näringsvärden
8. Spara felrapporter/loggar (`errorModel.js`): systemfel och felsökningshistorik
9. Spara inläggsrapporter (`reportPostModel.js`): flaggade inlägg och moderering
10. Spara användarrapporter (`reportUserModel.js`): rapporterade konton och anledningar
11. Sparade inlägg: user_id + post_id relation
12. Relationer: 
    - user -> post (1 till många)
    - post -> comment (1 till många)
    - comment -> reply (1 till många)
    - user -> notification (1 till många)
    - user -> likes (många-till-många)

#### Funktioner 
1. Validering: se till att text, bild/video, profilinfo följer rätt format/filstorlek
2. Säkerhet: sessionshantering, token-baserad autentisering, skydd mot oönskad åtkomst
3. Filhantering: hur bilder/videos lagras via Cloudinary
4. Notishantering: Skapa, hämta och markera notiser som lästa i realtid.

## Teknik & programmeringsspråk

* **Frontend:** React, HTML, CSS, Tailwind, React Router DOM, Axios, React Icons, React Timeago
* **Backend:** Node.js, Express.js, Mongoose, Resend, firebase-admin (för att skicka push-notiser från servern)
* **Realtid & Notiser:** socket.io (backend), socket.io-client (frontend)
* **Databas:** MongoDB
* **Säkerhet:** JWT, bcrypt
* **Verktyg:** Nodemon, Dotenv, CORS, uuid, Postman (API testing), Validator
* **Filhantering:** Multer, Cloudinary
* **Hosting & Domän:** Vercel (Frontend), Render (Backend), Porkbun (DNS & Domänhantering)
* **Mobilapp (Native):** Capacitor (Android-stöd)
* **Mobila Funktioner:** `@capacitor/camera` (för bildhantering direkt via enhetens kamera), `@capacitor/push-notifications` (för notiser)

## Arkitektur
Applikationen är byggd enligt MERN-stackens arkitektur där frontend, backend och databas är separerade men kommunicerar via ett REST-API.

* React hanterar användargränssnittet och skickar förfrågningar till backend.
* Express/Node.js fungerar som API och hanterar affärslogik samt autentisering.
* MongoDB lagrar användare och data.
* Kommunikation mellan frontend och backend sker via HTTP-requests med Axios.

## API Testing

Under utvecklingen användes Postman för att testa backendens API-endpoints (GET, POST, PUT, DELETE) för att verifiera att funktioner som autentisering, inlägg och kommentarer fungerade korrekt innan de kopplades till frontend.

## Installation

1. Klona ner projektet i en mapp på din dator

    ```bash
    git clone [https://github.com/Kimskogfelter/Liftly_examen](https://github.com/Kimskogfelter/Liftly_examen)
    cd Liftly_examen
    ```

2. Installera dependencies

    Öppna två separata terminaler i projektmappen och kör följande kommandon:

      Backend:

      ```bash
      cd backend
      npm install --legacy-peer-deps
      ```


      Frontend:

      ```bash
      cd frontend
      npm install
      ```

3. Skapa `.env` fil i **backend** med nedan variabler

    ```env
    PORT=5000
    DB_USERNAME=your_database_username
    DB_PASSWORD=your_database_password
    MONGO_URI=your_mongodb_connection_string

    JWT_SECRET=your_super_secret_jwt_key
    JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key

    LIFTLY_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    LIFTLY_CLOUDINARY_API_KEY=your_cloudinary_api_key
    LIFTLY_CLOUDINARY_API_SECRET=your_cloudinary_api_secret

    RESEND_API_KEY=your_resend_api_key
    FRONTEND_URL=http://localhost:5173
    ```

4. Skapa `.env` fil i **frontend** med nedan variabler

    ```env
    VITE_API_URL=your_backend_url
    ```

5. Starta applikationen

    Kör följande kommandon i respektive terminal:

    Backend:
    ```bash
    npm run dev
    ```

    Frontend:
    ```bash
    npm run dev
    ```
    ### Lokala url
    * Frontend: http://localhost:5173  
    * Backend API: http://localhost:5000

    ### Live demo
    * **Frontend:** https://liftlyfit.com
    * **Backend API:** https://api.liftlyfit.com


## Design

### Figma
Här är en Figma-skiss för designen av hemsidan. 
https://www.figma.com/design/DwmMKIZb9NEAqBsgdjA8FS/Case_examen_Liftly?node-id=0-1&t=cEzKXCzBBMna6P1I-1


## Inspiration & resurser

I detta avsnitt listar jag tutorials, guider och tidigare projekt som har inspirerat delar av min social media-app. Koden har anpassats för detta projekt, och jag har lagt till egen logik där det behövdes för att passa appens funktionalitet. 

* Som inspiration och hjälp med grundstrukturen har jag valt att följa denna tutorial: https://www.youtube.com/watch?v=BEIaBF6oZ0M
* För hjälp med syntax och ES-moduler: https://www.youtube.com/watch?v=BqRWK57dwqo
* Cloudinary & Multer-integration: https://salmasaaiou.medium.com/file-uploads-using-cloudinary-and-multer-eb22bf928f18

## Syfte 

### Tekniskt syfte
Projektet skapades för att utveckla praktiska kunskaper inom fullstack-utveckling och förstå hur olika delar av en webbapplikation samverkar.
Under projektet har följande områden utforskats:
* Bygga REST API med Node.js och Express
* Datamodellering med MongoDB och Mongoose
* Autentisering med JWT och säker lösenordshantering med bcrypt
* State management och routing i React samt kommunikation via Axios
* Mikrointeraktioner & funktioner som haptisk feedback (`navigator.vibrate`) och delning av träningskalendrar direkt till flödet.

### Användarperspektiv
Syftet med applikationen är att skapa en plattform med fullt fokus på träning och hälsa där användare kan samla, organisera och dela sitt träningsinnehåll på ett strukturerat sätt (till skillnad från vanliga sociala medier där träningsinnehåll lätt blir utspritt).

## AI-användning som utvecklingsstöd

Under utvecklingen av *Liftly* (särskilt i fasen efter skolan då projektet har drivits vidare som en riktig produkt med en live-miljö på `liftlyfit.com`) har AI använts i stor utsträckning som ett aktivt verktyg och en virtuell medutvecklare. 

Genom att nyttja AI har jag kunnat hålla ett högt tempo, automatisera repetitiva moment och säkerställa att kodbasen följer god praxis, vilket har varit helt avgörande för att få ut applikationen i produktion.

**AI har fungerat som ett stöd för:**
* **Arkitektur & Kodstruktur:** Bollplank för att bryta ut komplexa komponenter (exempelvis uppdelningen av kalendervyer, modaler och flödeskomponenter) och hålla koden modulär.
* **UI & Design:** Översättning av designidéer och skisser direkt till ren Tailwind-styling med fokus på responsivitet och enhetlighet.
* **Felsökning & Optimering:** Snabb felsökning vid asynkrona anrop, state-hantering i React och hantering av edge-cases i databasen.
* **Dokumentation & Processer:** Strukturering av kodkommentarer, commit-flöden och projektets dokumentation.

## Framtida utveckling

Planerade funktioner för framtida versioner av appen:
* Visa online-användare
* Realtidschatt med Socket.IO
* Förbättrad sessionshantering och enhetshantering
* Adminpanel för att blockera och hantera användare