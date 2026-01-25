Authentication + Authorisation

JWT -> Json Web Token

JSon 

{
    key : value
}

Eg : 

{
    Name : Abhay Singh
    Age : 25
    Education : SE
    Ocuupaion : JOB
}

It Commonly Used for Authorisation and Authentication both
Stateless -> 




WHY JWT?

1. Tradational Session Based Authentication


S1  -------> S2 
S1  <------- S2



JWT Structure :

xxxxx.yyyyy.zzzzzz
1. Header {} : alg :HS256 (Signing Algorithm), typ : JWT. => Base64 URL
2.Payload : {} Data and Metadata
3. Signature : secrets




How JWT Authentication Works :
0.2 seconds to 1 minutes 

Step by Step FLow
1. User Logs in with Credentials 
2. Server validation for Credentials
3. Sever generates JWT
4. Client store JWT
5. Client sent JWT in every request
7. Access granted or dennied 










┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT REQUEST                                │
│                    (Browser, Mobile App, Postman)                       │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         server.js (Entry Point)                          │
│                    Starts Express server on port 3001                   │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            app.js (Express App)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │   Helmet    │ │    CORS     │ │ Rate Limit  │ │  Body Parser    │   │
│  │ (Security)  │ │ (Cross-Org) │ │ (Throttle)  │ │ (JSON parsing)  │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         routes/index.js (Router)                         │
│                                                                          │
│    /api/v1/auth/*  ──→  auth.routes.js                                  │
│    /api/v1/users/* ──→  user.routes.js                                  │
│    /api/v1/roles/* ──→  role.routes.js                                  │
│    /api/v1/permissions/* ──→ permission.routes.js                       │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MIDDLEWARE CHAIN                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Validators  │─▶│ authenticate │─▶│    RBAC      │                  │
│  │(Input Check) │  │(Token Check) │  │(Permissions) │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           CONTROLLERS                                    │
│         auth.controller.js  │  user.controller.js  │  role.controller   │
│         (Handle Request)    │  (Handle Request)    │  (Handle Request)  │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            SERVICES                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │ auth.service   │  │ token.service  │  │ user.service   │            │
│  │ (Login Logic)  │  │ (JWT Handling) │  │ (User CRUD)    │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     DATABASE (PostgreSQL + Prisma)                       │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │  Users   │  │  Roles   │  │ Permissions │  │  RefreshTokens   │     │
│  └──────────┘  └──────────┘  └─────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘














