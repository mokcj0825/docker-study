# Docker Compose

This is the minimum structure for the docker compose: 
```yml

services: 
  service_name: 
    build: 
      context: .
      dockerfile: Dockerfile
    ports: 
      - "3000:3000"
  service_name2: 
    build: 
      context: ./another_directory
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
```

It stands for "Create service_name and service_name2 containers based on their corresponding directory and port mappings." For example (No typo error in this example): 
```yml

services: 
  arbitrary_service: 
    build:
      context: .
      dockerfile: Dogefile
    ports:
      - "2000:2000" 
  another_arbitrary_service:
    build:
      context: ./another_directory
      dockerfile: Dockerfile
    ports:
      - "2200:2200"
```

Two containers called "arbitrary_service" and "another_arbitrary_service" will be created with port mappings `2000:2000` and `2200:2200` respectively. Docker Compose will attempt to load the `Dogefile` in the `CURRENT DIRECTORY` for "arbitrary_service," and `Dockerfile` in `CURRENT_DIRECTORY/another_directory` for "another_arbitrary_service."

Besides build, we have `volumes`. This will create the "pre-defined" directory in our newly created container. For example: 
```yml
services:
  gugugaga:
    build: 
      context: ./gagagugu
      dockerfile: Dockerfile
    ports: 
      - "2333:2333"
    volumes: 
      - ./gagagugu:/app
      - /app/node_modules
      - /app/abcde/drumstick
```
When `docker-compose up --build`, it will create this three directories in the `gugugaga` container. The `./gagagugu` directory in your device will sync to the container `gugugaga`'s `app` directory. For example: 
```
This is your (host) directory structure
project-name
├─ gagagugu                   # Sync with container
│  ├─ wakawaka                # Sync with container
│  │  └─ readyounoreadme      # Sync with container
│  └─ aabbccdd.file           # Sync with container
├─ abcdefg                    # Not sync
└─ meowmeow                   # Not sync

In your gugugaga container: 
app
├─ wakawaka                # Sync with host
│  └─ readyounoreadme      # Sync with host
├─ aabbccdd.file           # Sync with host
├─ node_modules            # Managed by Docker but not visible to host.
└─ abcde                   # Managed by Docker but not visible to host.
   └─ drumstick            # Managed by Docker but not visible to host.
```
Then followed by environment. This is the "system configuration" for your Docker container. For example: 
```yml
services:
  s: 
    build:
      context: ./
      dockerfile: F
    ports: 
      - "2333:2333"
    volumes:
      - ./a:/app
    environment: 
      - KEY_ONE=value_one
      - KEY_TWO=value_two
      - KEY_THREE=value_three
```
Then, in your (host) code: 
```typescript
...
console.log(process.env.KEY_ONE);
...
```
When run in your container, this line will show "value_one". This is somewhat environment specific "pre-configuration" for your docker container.

Then, we have `depends_on` to alter the startup order. In fact, this is less critical in dev environment, since we have fully control over ALL environments. But if our project have this structure: 
`front-end` --Rely-> `back-end microservices` --Rely-> `ad hoc microservices` --Rely-> `database`

For example, real-time notification
- Front end will establish connection with back-end microservices
- Back-end relay to ad-hoc microservices
- Ad-hoc microservices listen on database triggers.

Then the database container requires 10 seconds to start up. In these 10 seconds, this feature will "temporarily down" due to connection failed on "Ad-hoc microservices listen on database triggers." 
So, we use `depends_on`. For example:
```yml
services: 
  alpha:
    <your_configuration>
    depends_on:
      - beta
  beta:
    <your_configuration>
    depends_on:
      gamma:
        condition: service_healthy
        restart: true
  gamma:
    <your_configuration>
```
When we docker-compose up --build:
1. Container alpha will WAIT until container beta is ready to connect.
2. Container beta will WAIT until container gamma emits the "service_healthy" condition.

On the other hand, the `restart:true` specify that, if the container `gamma` is restarted, container `beta` will restart automatically. 

In this yml, exist `restart: unless-stopped`. This `restart` is not that `restart`. 
This is **restart policy** for that particular container. In this case, the `unless-stopped` will ALWAYS restart the container unless manual stop. For example: 
```bash
docker stop container_name_with_always_start
```
The `always` restart-container will stop, then restart again, unless remove the container, stop the entire Docker service, or pause it. This is the difference between `unless-stopped` and `always`.