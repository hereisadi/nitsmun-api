# REST API of NITSMUN

## Getting Started
### Prerequisites

 - NodeJS, NPM, PNPM (https://pnpm.io/installation)
 - A MongoDB server, local or remote.

### Installing

  - Clone the repo and check out the code
  - Run 
    ```
    $ pnpm install 
    $ pnpm dev
    ```
  - Set following environment variables in a .env file in the root directory
    ``` 
    #Database server connection URI
    MONGODB_URL = 'mongodb://<user_name>:<password>@xxxxx.test.com:xxxxx/<db_name>'

    #jwt secret
    JWT_SECRET_KEY = <some string> ex: 'mytoughandhardjwtsecret'
        
    #email credentials
    EMAIL = <e-mail address, from which you will be sending the account verification emails to new users> ex:"test@gmail.com"
    PASSWORD = <app passowrd which you can get from google account dashboard> 
       
    #Frontend website link:
    website = https://nitsmun.in

  - Run ``$ pnpm dev`` to start back end on port 3880

## Available Routes

### User Authentication


- Register new user with email

```
Method: POST
Type: public
Route:
/v1/api/signup
payload: name,email, phone, password, confirmPassword, isStudentOfNITS (instituteEmail, scholarID, branch, year if isStudentOfNITS===true )
```

- Login user with email

```
Method: POST
Type: public
Route:
/v1/api/login
payload: email, password
```

- Send Email Verification link

```
Method: POST
Type: Private
Route:
/v1/api/sendlink
payload: {} (none)
role: all
```

- Verify Email through verify link sent on email
```
Method: PUT
Type: Public
Route: 
/v1/api/verifytoken
payload : token

```

- Send link to reset password
```
Method: POST
Type: Public
Route: 
/v1/api/sendresetpwdlink
payload : email
```

- Verify token to reset password
```
Method: PUT
Type: public
Route:
/v1/api/resetpassword
payload: token, newpwd, cnewpwd
```

- Edit profile
```
Method: PUT
Type: private
Route:
/v1/api/all/edit/profile
role: all
payload : newName, newPwd, confirmNewPwd, phone

```

- Dashboard
```
Method: GET
Type: private
Route:
/v1/api/dashboard
role: all
payload : none

```

- Check if account exists or not
```
Method: GET
Type: public
Route:
/v1/api/accounttest/:email
role: all
payload : none
params: email

```

- Register for an event
```
Method: POST
Type: Private
Route:
/v1/api/reg/yp
role: client
payload : payment,
        eventName,
        previousMunExperience,
        committeePreference,
        portfolioPreference, college
```

- Fetch all Registered events (STUDENT)
```
Method: GET
Type: Private
Route:
/v1/api/client/allevents
role: client
payload, params: none
```

- Fetch all Registered events (ADMIN)
```
Method: GET
Type: Private
Route:
/v1/api/admin/getregistered/:eventName
role: admin && superadmin
payload: eventName as params
```

- Confirm the registration (ADMIN)
```
Method: PUT
Type: Private
Route:
/v1/api/admin/confirm/reg
role: admin
payload: regID
```

- Decline the registration (ADMIN)
```
Method: PUT
Type: Private
Route:
/v1/api/admin/decline/reg
role: admin
payload: regID
```

- Fetch all Created accounts (SUPERADMIN)
```
Method: GET
Type: Private
Route:
/v1/api/admin/superadmin/getallaccounts
role: superadmin
payload: none
```

- Elevate the role to admin (SUPERADMIN)
```
Method: PUT
Type: Private
Route:
/v1/api/admin/elevate/admin
role: superadmin
payload: accountID
```

- Demote the role to client (SUPERADMIN)
```
Method: PUT
Type: Private
Route:
/v1/api/admin/demote/client
role: superadmin
payload: accountID
```

- Fetch pending registrations (ADMIN)
```
Method: GET
Type: Private
Route:
/v1/api/admin/getpendingreg/:eventName
payload: eventName (as params)
role: admin

```

- Fetch Confirmed registrations (ADMIN)
```
Method: GET
Type: Private
Route:
/v1/api/admin/getconfirmedreg/:eventName
payload: eventName (as params)
role: admin

```

- Fetch declined registrations (ADMIN)
```
Method: GET
Type: Private
Route:
/v1/api/admin/getdeclinedreg/:eventName
payload: eventName (as params)
role: admin

```

- Delete any account (SUPERADMIN)
```
Method: DELETE
Type: Private
Route:
/v1/api/superadmin/deleteaccount
payload: accountID
role: superadmin

```

- Get scheduled account deletion (SUPERADMIN)
```
Method: GET
Type: Private
Route:
/v1/api/superadmin/getscheduleddeleteaccount
payload: none
role: superadmin

```

- delete account on its own for the role CLIENT
```
Method: PUT
Type: Private
Route:
/v1/api/client/deleteaccount
payload: {} (none)
role: client

```

- Contact us form
```
Method: POST
Type: Pulic
Route:
/v1/api/v
payload: name, email, message
role: all

```

- Contact us responses (ADMIN, SUPERADMIN)
```
Method: GET
Type: Private
Route:
/v1/api/getcontactusres
payload: {} (none)
role: ADMIN and SUPERADMIN

```

## Deployment
To deploy on Render, create an account and set up environment variables. Then provide ``pnpm i`` under build command and ``pnpm dev`` under start command.


## Contributing

Please create an issue and start working a feature/ bug you prefer :rocket:.

## License

This project is licensed under GNU GENERAL PUBLIC LICENSE.