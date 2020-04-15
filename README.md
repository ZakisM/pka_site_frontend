# PKA Index Frontend

This repo holds the frontend code for https://www.pkaindex.com.

To run locally:

Setup https://github.com/ZakisM/pka_site_backend/ first.

#### To develop/test
1. `yarn install`
2. `yarn start`
3. Visit https://pkaindextest.com in your browser. 

#### Test With Docker - Note this is creating an optimized build so not suitable for development.
1. `docker build -t zakism/pka-site-frontend:latest .`
2. `docker run -p 5678:5678 zakism/pka-site-frontend:latest`
3. Visit https://pkaindextest.com in your browser.