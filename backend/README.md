# ZITADEL Configuration Guide

A step-by-step guide to set up ZITADEL for a web app and API with Google OAuth integration.

---

## **Setup Steps**

### 1. **Create Instance & Organization**

- Log in to ZITADEL Console and create a new instance. Enter the instance and organization name which you want to create and then select any region below.

![Instance image 1](./public/readME%20images/instance%201.png)

- Then click on the Visit button to proceed.

![Instance image 2](./public/readME%20images/instance%202.png)

---

### 2. **Organization ID**

- Now that you are logged into the ZITADEL dashboard,  click **Organization** in the top menu, and copy the `Resource Id` and paste it in .env as *`ORGANIZATION_RESOURCE_ID`*

![Organization Image 1](./public/readME%20images/organization%201.png)

### 3. **Create Service User**

- Then from top menu click **Users** -> then click **Service Users** -> click **New** and fill form, select accessType = jwt and submit form.

![Service User Image 1](./public/readME%20images/Service%20User%201.png)

- Then click on Actions on right, generate Client Secret copy the service user client secret and paste in .env file as _`SERVICE_USER_CLIENT_SECRET`_.

![Service User Image 2](./public/readME%20images/Service%20User%202.png)

- Then from the left menu click on "Personal access token" and then click on **New** and create a personal access token and save in .env file as _`SERVICE_PERSONAL_ACCESS_TOKEN`_.

![Service User Image 3](./public/readME%20images/Service%20User%203.png)

- Add service user as a manager in organization. Click organization in top menu and click + to add manager select the service user and make it owner of the organization.

![Service User Image 4](./public/readME%20images/Service%20User%204.png)

### 4. **Create Project**

- Click projects from top menu, create a project and then select your newly created project. Copy the `resource id` and save it in the .env file as _`PROJECT_RESOURCE_ID`_.

![Project Image 1](./public/readME%20images/Project%201.png)

- Click General from left menu, and check all boxes for branding settings.

![Project Image 2](./public/readME%20images/Project%202.png)

- Click on roles from left menu, and create new roles (buyer, merchant etc) and save.

![Project Image 3](./public/readME%20images/Project%203.png)

- Click on grants from left menu, then click + and add these roles to your organization.

![Project Image 4](./public/readME%20images/Project%204.png)

### 5. **Create Web Application**

- Then in project's general click on the **New** button to create an application.

![WEB Application Image 1](./public/readME%20images/Web%20App%201.png)

- Then give a name to the app and Select **WEB** and click on **continue**

![WEB Application Image 2](./public/readME%20images/Web%20App%202.png)

- Then Select **PKCE** as authentication method and **continue**

![WEB Application Image 3](./public/readME%20images/Web%20App%203.png)

- Then in **Redirect URL** add the redirect urls here and also enable the development mode on.
  - `http://localhost:3000/login`
  - `http://localhost:3000/verify`

- Then below in **Post logout URLs** here paste the link of the page you want to show after logout like below:
  - `http://localhost:3000/`

- Then click on **continue** and then create.

![WEB Application Image 4](./public/readME%20images/Web%20App%204.png)

- Now you are in your **Web app** configurations now from here copy the `Client Id` and paste it in .env file as `WEB_APPLICATION_CLIENT_ID`.

![WEB Application Image 6](./public/readME%20images/Web%20App%206.png)

- Then select the **Token settings** from the left menu and check the boxes of user role and info inside the token and save.

![WEB Application Image 5](./public/readME%20images/Web%20App%205.png)

### 6. **Create API Application**

- Then in project's general again click on the **New** button to create an application. Then give a name to the app and Select **API** and click on **continue**

![Api Application Image 1](./public/readME%20images/API%20App%201.png)

- Then Select **BASIC** as authentication method and **continue**

![Api Application Image 2](./public/readME%20images/API%20App%202.png)

- Then it will gave you the **Client Id** and **Client Secret** copy them and paste them in .env as *`API_APPLICATION_CLIENT_ID`* and *`API_APPLICATION_CLIENT_SECRET`*.

![Api Application Image 3](./public/readME%20images/API%20App%203.png)

### 7. **Zitadel settings**

- From top right click on default settings to go to settings

![Setting Image 1](./public/readME%20images/Settings%201.png)

- Then from top copy the custom domain and use the `https://` at start and paste it in .env file as `ZITADEL_INSTANCE_URL`. Then from left menu click on Login Behavior and Security and set Passwordless Login to "Not Allowed"

![Setting Image 2](./public/readME%20images/Settings%202.png)

- Then scroll down and disable the "Phone Login" and uncheck the "Organization Registration allowed" and click on save. Then from right menu click on "OIDC token lifetime and expiration".

![Setting Image 3](./public/readME%20images/Settings%203.png)

- Then set the 24hrs for ID Token, and Access Token expiry and scroll down to save.   Then from right menu click on "Identity Providers".

![Setting Image 4](./public/readME%20images/Settings%204.png)

### 8. **SET Google Identity Providers (IDP)**

- First in IDP screen you need to click on Google.

![IDP Image 1](./public/readME%20images/IDP%201.png)

- Here you will see some fields and url. Now for the client secret and client id we need these from google cloud console project. SO copy the ***ZITADEL Callback URL*** which we will use as redirect URL in google cloud console project.

![IDP Image 2](./public/readME%20images/IDP%202.png)

- Then go to [google console](https://console.cloud.google.com/) and on top left just after the logo there is project option click on it and you will see a popup model then in model click on the ***New Project***.

![Google Image 1](./public/readME%20images/google%201.png)

- Then add the project name and click on create. By this your project will be created

![Google Image 2](./public/readME%20images/google%202.png)

- Then in this page on top right there is a notification icon click on it and select the newly created project. Then from top left click on the menu.

![Google Image 3](./public/readME%20images/google%203.png)

- Then in menu click on ***APIs and services*** and then in dropdown click on ***OAuth consent screen***.

![Google Image 4](./public/readME%20images/google%204.png)

- Then select the option ***External*** and click on create and fill some form.

![Google Image 5](./public/readME%20images/google%205.png)

- Then go to the **Credentials** and click on ***Create Credentials*** and select option ***OAuth client ID***.

![Google Image 6](./public/readME%20images/google%206.png)

- Then in this form select the application type as ***Web Application*** and select option ***OAuth client ID*** add the name.

![Google Image 7](./public/readME%20images/google%207.png)

- Then scroll down to ***Authorised redirect URLs*** and click on **+**. Then here paste the ***ZITADEL Callback URL*** and then click on create.

![Google Image 8](./public/readME%20images/google%208.png)

- Then there is modal open from where you will copy the ***Client Id*** and ***Client secret*** or saved them in json file.

![Google Image 9](./public/readME%20images/google%209.png)

- Then again come back to the Zitadel where you were creating IDP here in the fields of client secret and client id paste the google project keys which we just created.

![IDP Image 3](./public/readME%20images/IDP%203.png)

- Then Scroll down and set options like below in screenshot and click on create and then save

![IDP Image 4](./public/readME%20images/IDP%204.png)

- Then you are redirected back to the IDP listing where you will see your newly created Google IDP. Hover on it, and you will a option of **set as active** click on it to activate this IDP.

![IDP Image 5](./public/readME%20images/IDP%205.png)

### 9. **Create Action**

- Click Actions from top menu, in Scripts add new +

![Action Image 1](./public/readME%20images/Action%201.png)

-  Add Name for Action e.g "googleCallback" and then in body past the script code. Make sure the Action Name and the script function name must be same.

![Action Image 2](./public/readME%20images/Action%202.png)

- The action only works with a live http URL, so use ngrok to generate a live URL of your localhost backend app. While the script is below


```javascript
let http = require('zitadel/http');
let logger = require("zitadel/log");
let baseURL = 'https://dac4-2404-3100-104b-25b-a1ee-35a-57cf-e0df.ngrok-free.app';

async function googleCallback(ctx, api) {
    try {
        const user = await http.fetch(`${baseURL}/api/v1/user/google-callback`, {
            method: 'POST',
            body: {
                userId: ctx.v1.authRequest.userId,
                state: ctx.v1.authRequest.transferState
            }
        }).json();
        logger.log('User ID:', user.id);
    } catch (error) {
        logger.log('Error in googleCallback:', error.message);
    }
}
```


-  Then scrol to "Flows" and select a "Flow Type" = External Authentication and click on "Add Trigger", Select the "Trigger Type" = PostCreation and under action select the action you just created above "googleCallback".

![Action Image 3](./public/readME%20images/Action%203.png)
![Action Image 4](./public/readME%20images/Action%204.png)
