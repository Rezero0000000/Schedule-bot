---

# Schedule.bot

## 1. **Download from GitHub**
Follow these steps to download the bot from GitHub:

### Step 1: Clone the Repository
1. Open a terminal/command prompt.
2. Run the following command to clone the repository:
   ```bash
   https://github.com/Rezero0000000/Schedule.bot.git
   ```


### Step 2: Navigate into the Project Directory
3. After cloning, navigate into the project folder:
   ```bash
   cd Schedule.bot
   ```

## 2. **Compile the Project**
The project may need dependencies to be installed and compiled before it can run properly. Follow these steps:

### Step 1: Install Dependencies
Ensure you have `Node.js` installed on your machine. Then, install the required dependencies using:
```bash
npm install
```

### Step 2: Compile the Code
If the project uses TypeScript or needs to be compiled, you can compile it using:
```bash
npx tsc --watch
```

### Step 3: Start the Bot
Finally, run the bot using:
```bash
npm run dev
```

## 3. **Commands List**

Once the bot is running, you can interact with it via WhatsApp using the following commands:

| Command               | Description                                             |
|-----------------------|---------------------------------------------------------|
| `/register`              | Registers a new user to the system.                     |
| `/login`               | Logs a user into the system. If not registered, prompts a "Please register first." message. |
| `/help`                | Provides a list of available commands and their usage.   |
| `/schedule`              | Displays your schedule for the day or week.             |
| `/attendance`               | Marks your attendance, requires location permissions.   |
| `/status`              | Displays the current status of the bot.                 |
| `/logout`              | Logs the user out of the system.                        |

## 4. **Development Notes**
- Make sure that the `./database/file.sqlite3` is not added to the repository as it is ignored in `.gitignore`.
- The `knex` migration files are used for handling database schema, and the seeds are used for populating initial data.
- For debugging the database, use the following command:
  ```bash
  npm run db
  ```