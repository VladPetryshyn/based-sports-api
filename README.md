This project works best with [Based Sports](https://github.com/VladPetryshyn/based-sports)

# based-workout-api

## Setting up and running
To follow these steps you need to have yarn and node.js installed

### Downloading repository
`git clone https://github.com/VladPetryshyn/based-sports-api.git`
`cd based-sports-api && yarn`

### Adding environment variables
`echo "MONGODB_URL=Your mongodb url" >> .env`
`echo "SECRET=Your secret" >> .env`

### Running
`yarn run dev`
Program will be running at [localhost](http://localhost:8000)
Try going to the /posts route to check if everything is working properly
