# System Architecture and Flow Diagrams

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Authentication Flow](#authentication-flow)
3. [Record Request Flow](#record-request-flow)
4. [Database Schema](#database-schema)
5. [Component Hierarchy](#component-hierarchy)
6. [Real-time Communication](#real-time-communication)

## System Architecture

\`\`\`mermaid
graph TB
    subgraph Client
        R[React Frontend]
        RC[React Components]
        RS[React State/Context]
    end
    
    subgraph Server
        E[Express Server]
        M[Middleware]
        C[Controllers]
        S[Services]
    end
    
    subgraph Databases
        P[(PostgreSQL)]
        Mo[(MongoDB)]
    end
    
    subgraph External
        ES[Email Service]
        WS[WebSocket Server]
    end
    
    R --> |HTTP Requests| E
    RC --> R
    RS --> R
    E --> M
    M --> C
    C --> S
    S --> P
    S --> Mo
    S --> ES
    R <--> |WebSocket| WS
    WS --> S
\`\`\`

## Authentication Flow

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Controller
    participant D as Database
    participant J as JWT Service
    
    U->>F: Enter Credentials
    F->>A: POST /api/auth/login
    A->>D: Verify Credentials
    D-->>A: User Data
    A->>J: Generate Token
    J-->>A: JWT Token
    A-->>F: Return Token + User
    F->>F: Store Token
    F-->>U: Redirect to Dashboard
\`\`\`

## Record Request Flow

\`\`\`mermaid
graph TD
    A[User] -->|Request Record| B(Check Authorization)
    B -->|Authorized| C{Record Available?}
    B -->|Unauthorized| D[Return Error]
    C -->|Yes| E[Create Request]
    C -->|No| F[Return Status]
    E --> G[Send Notifications]
    G --> H[Email]
    G --> I[WebSocket]
    G --> J[Database]
\`\`\`

## Database Schema

\`\`\`mermaid
erDiagram
    USERS ||--o{ RECORDS : manages
    USERS ||--o{ REQUESTS : makes
    RECORDS ||--o{ REQUESTS : has
    NOTIFICATIONS }o--|| USERS : receives
    
    USERS {
        int id PK
        string username
        string email
        string password
        string role
        datetime created_at
    }
    
    RECORDS {
        int id PK
        string title
        string file_number
        string status
        int created_by FK
        datetime created_at
    }
    
    REQUESTS {
        int id PK
        int user_id FK
        int record_id FK
        string status
        datetime request_date
        datetime return_date
    }
    
    NOTIFICATIONS {
        int id PK
        int user_id FK
        string type
        string message
        boolean read
        datetime created_at
    }
\`\`\`

## Component Hierarchy

\`\`\`mermaid
graph TD
    subgraph App
        A[App Component]
        R[Router]
        L[Layout]
    end
    
    subgraph Pages
        D[Dashboard]
        AR[Admin Records]
        UR[User Records]
        P[Profile]
    end
    
    subgraph Components
        RC[Record Card]
        RF[Request Form]
        NT[Notification Toast]
        DT[Data Table]
    end
    
    A --> R
    R --> L
    L --> D
    L --> AR
    L --> UR
    L --> P
    
    D --> RC
    D --> NT
    AR --> DT
    AR --> RF
    UR --> RC
    UR --> RF
\`\`\`

## Real-time Communication

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant WS as WebSocket Server
    participant S as Server
    participant DB as Database
    
    C->>WS: Connect
    WS->>C: Connection Established
    C->>WS: Authenticate (userId)
    WS->>WS: Join User Room
    
    S->>DB: Record Status Change
    S->>WS: Emit Event
    WS->>C: Send Notification
    
    Note over C,WS: Real-time Updates
    
    C->>WS: Disconnect
    WS->>WS: Leave Rooms
\`\`\`

## State Management Flow

\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading: Fetch Data
    Loading --> Success: Data Received
    Loading --> Error: Request Failed
    Success --> Idle: Reset
    Error --> Idle: Retry
    Success --> Loading: Refresh
\`\`\`

## Request Lifecycle

\`\`\`mermaid
graph LR
    subgraph Frontend
        A[User Action] --> B[API Call]
        B --> C[Loading State]
        C --> D[Update UI]
    end
    
    subgraph Backend
        E[Route Handler] --> F[Middleware]
        F --> G[Controller]
        G --> H[Service]
        H --> I[Database]
    end
    
    B --> E
    I --> C
\`\`\`

## Error Handling Flow

\`\`\`mermaid
graph TD
    A[Error Occurs] --> B{Error Type}
    B -->|Validation| C[Return 400]
    B -->|Authentication| D[Return 401]
    B -->|Authorization| E[Return 403]
    B -->|Not Found| F[Return 404]
    B -->|Server Error| G[Return 500]
    
    C --> H[Log Error]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Send Response]
    I --> J[Update UI]
\`\`\`

## Notification System

\`\`\`mermaid
graph TD
    A[Event Trigger] --> B{Notification Type}
    B -->|Email| C[Email Service]
    B -->|WebSocket| D[Socket Server]
    B -->|Database| E[Save Notification]
    
    C --> F[Send Email]
    D --> G[Emit Event]
    E --> H[Update UI]
    
    F --> I[Mark Sent]
    G --> I
    H --> I
\`\`\`

## Deployment Architecture

\`\`\`mermaid
graph TD
    subgraph Client
        A[Browser] --> B[CDN]
        B --> C[React App]
    end
    
    subgraph Server
        D[Load Balancer] --> E[API Server 1]
        D --> F[API Server 2]
        E --> G[Cache]
        F --> G
    end
    
    subgraph Database
        H[(Primary DB)] <--> I[(Replica DB)]
    end
    
    C --> D
    E --> H
    F --> H
\`\`\`

These diagrams provide visual representations of:
1. Overall system architecture
2. Authentication flow
3. Database relationships
4. Component hierarchy
5. Real-time communication patterns
6. State management
7. Request lifecycle
8. Error handling
9. Notification system
10. Deployment architecture

Each diagram helps visualize different aspects of the system, making it easier to understand:
- How components interact
- Data flow through the system
- System processes and workflows
- Database relationships
- Component organization
- Error handling patterns
- Real-time communication
- Deployment structure

These visuals are particularly helpful for:
- New developers joining the project
- Understanding system architecture
- Planning system modifications
- Debugging issues
- Documentation purposes
- Team discussions

The diagrams use Mermaid markdown syntax, which can be rendered directly in many markdown viewers and documentation systems.
