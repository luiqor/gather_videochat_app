# GatherSpace 🌌

GatherSpace is a video conferencing application.

👉 Facilitates both public and private chats.

👉 Includes a screen-sharing feature.

👉 Provides meeting recording capabilities.

👉 Supports joining rooms via unique space codes.

### Technology stack

The application, built completly with JavaScript, follows the MVC (Model-View-Controller) architecture. Typeorm is used for coding models.

<img src="https://img.shields.io/badge/javascript-%23F7DF1E.svg?&style=for-the-badge&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/node.js-%23339933.svg?&style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/nodemon-%2376D04B.svg?&style=for-the-badge&logo=nodemon&logoColor=black" />
<img src="https://img.shields.io/badge/express-%23000000.svg?&style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/sql database-%23010101.svg?&style=for-the-badge&logo=sql&logoColor=white" />
<img src="https://img.shields.io/badge/typeorm-%23E34F26.svg?&style=for-the-badge&logo=typeorm&logoColor=white" />
<img src="https://img.shields.io/badge/socket.io-%23010101.svg?&style=for-the-badge&logo=socket.io&logoColor=white" />
<img src="https://img.shields.io/badge/ejs-%23981E32.svg?&style=for-the-badge&logo=ejs&logoColor=white" />
<img src="https://img.shields.io/badge/peerjs webrtc-%23FF4747.svg?&style=for-the-badge&logo=webrtc&logoColor=white" />

### Features Preview
Space creation

https://github.com/luiqor/gather_videochat_app/assets/141519826/4802091f-fefa-4b10-9e30-e1a6f670be45

Private and public chatting

https://github.com/luiqor/gather_videochat_app/assets/141519826/2f56e8f3-77e0-4ebf-933a-e37c1fee00b2

Disabling video

https://github.com/luiqor/gather_videochat_app/assets/141519826/5a25a64d-a477-422c-9d9a-329c17e5e2c1

Recording saving to downloads

https://github.com/luiqor/gather_videochat_app/assets/141519826/cdb777e4-d397-443c-9fd6-4b64f0159927

Joining a space

https://github.com/luiqor/gather_videochat_app/assets/141519826/0269a043-023c-4ee2-a8b4-e28d328863ec

Screensharing

https://github.com/luiqor/gather_videochat_app/assets/141519826/355bfecf-7af7-4b8b-9a34-193da75e9b00




### Setting Up the Development Environment

Follow these steps to set up and run the development version of the application:

1. **Install Dependencies:** Start by installing the necessary packages. Run the following command in your terminal:

   ```bash
   npm install
   ```

2. **Configure Environment Variables:** Create a `.env` file in the root directory of your project. This file will hold your environment variables. Here's an example configuration:

   ```bash
   PORT=3000
   DB_TYPE=sqlite
   DATABASE=gather.sqlite3
   SESSION_SECRET=your_secret_key
   ```

   Feel free to modify these values to suit your needs.

3. **Run the Application:** After setting up, you can start the application in development mode by running:

   ```bash
   npm run dev
   ```

   This command will start the server on the port specified in your `.env` file.
