# PKA Index Frontend

This repo holds the frontend code for https://www.pkaindex.com.

To run locally:

Setup https://github.com/ZakisM/pka_site_backend/ first.

#### To develop/test
1. `yarn install`
2. `yarn start`
3. Visit http://0.0.0.0:3000 in your browser. http://localhost:3000 will not work. This is because CORS on the backend will only allow origins from http://0.0.0.0:3000 and http://0.0.0.0:5678. 

#### Test With Docker - Note this is creating an optimized build so not suitable for development.
1. `docker build -t zakism/pka-site-frontend:latest .`
2. `docker run -p 5678:5678 zakism/pka-site-frontend:latest`
2. Visit http://0.0.0.0:5678 in your browser