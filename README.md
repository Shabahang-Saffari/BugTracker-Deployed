# :large_orange_diamond: BugTracker Application 
:computer: Developed by Shabahang Saffari
:envelope: shabahang.saffari@gmail.com

:link: **https://bugtracker-pro.azurewebsites.net/**

<br>

### 1. What is a bug tracker?

A bug tracker is a software tool used by development teams to record, prioritize, and track issues or bugs in software projects. It helps streamline communication and ensures efficient resolution of problems during development. 

<br>

### 2. Why using a bug tracker?

This bug tracker app was created to streamline bug management and enhance team collaboration ultimately improving the efficiency and effectiveness of software development processes.

<br>

### 3. Quick Start

In order to use the application online, navigate to the following link and follow the below instructions:

:small_orange_diamond: **https://bugtracker-pro.azurewebsites.net/**


 Click on the **Sign up** button and create an account **or** 

use the **Demo Mode** to try the app without creating an account.

<br>

### 4. Usage
As mentioned above, there are two options for using the app: 
- You can create a new account by clicking on the **Sign up** button.

or 
- You can click on the **Demo Mode** button and use one of the preexisting demo users (Admin, Project Manager, Developer, Submitter). 

⚠️ **Atention:** By using the Demo Mode, BugTracker app utilizes a demo database and any changes will not affect the main database of the application. 

<br><br>

After signing in to the application, you will have the following sections using the menu. 

#### :small_blue_diamond: Dashboard
The Dashboard section provides an overview of the current status of your projects and tickets. 

Here, users can:

- View all in-progress projects.
- View statistics related to tickets that were assigned to the user including: ticket status, type, and priority .
- Utilize search functionality to filter the projects table based on specific criteria.

#### :small_blue_diamond: Projects
In the Projects section, users can view all the existing projects assigned to them. Key functionalities include:

- Browse and search all projects assigned to the user (Admins have access to all exisiting projects).
- Editing or deleting projects as needed. (Admin and Project Manager users only)
- Accessing detailed information about each project, including project details page.

#### :small_blue_diamond: Tickets
The Tickets section allows users to access their assigned tickets. Here, users can:

- View all tickets assigned to them.
- Edit tickets. (Admin, Project Manager, Developer users)
- Delete Tickets. (Admin, Project Manager)
- Navigate to the detailed page of each ticket for further information.

#### :small_blue_diamond: Manage Role Assignment
The Manage Role Assignment section, accessible only to admin users, offers tools for user management. Key features include:

- Search users' information.
- Edit or delete user accounts.

<br>

### 5. How to clone this repository?

In order to clone this repository follow the below instruction:

- **Copy the following repository URL:**

  https://github.com/Shabahang-Saffari/BugTracker-Deployed.git

- **Open your terminal (for Mac) or command prompt (for Windows) on your local machine.**

- **Navigate to the Directory:** Use the cd command to navigate to the directory where you want to clone the repository.

- **Clone the Repository:** Once you're in the desired directory, use the git clone command followed by the URL you copied earlier **or simply copy and paste the entire following command:**

  ```bash

  git clone https://github.com/Shabahang-Saffari/BugTracker-Deployed.git

  ```

<br>

### 6. How to run the application?

- **Install Dependencies:** Navigate into the cloned directory (BugTracker-Deployed) using your terminal or command prompt, and then run:

  ```bash

  npm install

  ```

  This command will install all the dependencies listed in the package.json file.

  <br>

- **Create a .env file in the root directory of the project.**

  <br>
- **Database Configuration and Secret Keys:**
You need to have two MS SQL Server instances set up on Microsoft Azure for the BugTracker application. You also need the secret keys in order to run the application, contact me at **shabahang.saffari@gmail.com** to obtain the necessary connection strings for accessing the databases as well as the secret keys.

  <br>


  :mailbox_with_mail: After receiving the necessary information by email add the following info to the **.env** file and replace the **"ENTER FROM THE EMAIL"** with the actual values from the email.

  ```bash

  # ******** Main DB **********
  DB_HOST= ENTER FROM THE EMAIL
  DB_Database= ENTER FROM THE EMAIL

  # ******** Demo DB **********
  DB_HOST_Demo= ENTER FROM THE EMAIL
  DB_Database_Demo= ENTER FROM THE EMAIL


  DB_USER= ENTER FROM THE EMAIL
  DB_PASS= ENTER FROM THE EMAIL
  DB_PORT=1433

  # ******* JWT *******
  JWT_SECRET = ENTER FROM THE EMAIL
  JWT_LIFETIME = 1d

  #******* SendGrid Email ******
  SENDGRID_API_KEY = ENTER FROM THE EMAIL

  ```

  <br>

- **Start the Development Server:** Once the dependencies are installed, and your **.env** file is updated with the correct values you can start the development server by running:

  ```bash

  npm start

  ```
<br><br>
Thank you for using the BugTracker application.
<br><br><br><br><br><br>

:copyright: Shabahang Saffari
<br>
:envelope: shabahang.saffari@gmail.com


