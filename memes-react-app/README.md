Here's the README for the project:

# Memes React App

This project is a React-based web application for viewing and liking memes. It uses MongoDB for database plus serverless backend and DigitalOcean Spaces for hosting meme images and videos.

## Features

- View memes (images and videos)
- Like memes
- Randomized meme order (always starting with filename "start" if it exists)
- Responsive design
- Animated like button
- Keyboard navigation
- Progress tracking
- End summary screen
- Caching state locally for 7 days

## Technologies Used

- React
- TypeScript
- Ant Design
- MongoDB
- DigitalOcean Spaces

## MongoDB Database & Serverless Backend

For this project, MongoDB is used to store and retrieve like counts for memes. The application interacts with MongoDB through two main endpoints:

1. Get All: Retrieves all documents from the "Likes" collection.
2. Increment One: Increments the like count for a specific meme.

These endpoints are implemented as MongoDB Atlas Functions, which allow serverless execution of database operations. The functions can be found in the `mongodb` folder.

Structure of databade:

The MongoDB database for this project has a simple structure:

- Database: "memes"
  - Collection: "Likes"
    - Documents:
      {
      "\_id": String,
      "likes": Number
      }

Each document in the "Likes" collection represents a meme and its associated like count. The "\_id" field corresponds to the ETag from the DigitalOcean Spaces list SML (Simple Storage List), which uniquely identifies each meme object in the storage. The "likes" field stores the number of likes for that meme.

## Key Components

1. `App.tsx`: Main application component
2. `api.tsx`: API functions for interacting with MongoDB and fetching memes
3. `ButtonComponent.tsx`: Reusable button component with animation support

## Key Libraries Used

1. `axios`: Used for making HTTP requests to the MongoDB and DigitalOcean Spaces APIs
2. `color2k`: Used for converting color shades to a specific brightness
3. `colorthief`: Used for extracting color information from images
4. `react-lottie-player`: Used for playing animated memes
5. `react-player`: Used for playing video memes

## Setup and Deployment

1. Install dependencies:

   ```
   npm install
   ```

2. Run the development server:

   - Comment out the custom webpack config in `config-overrides.js` before running locally (block below: Merge the custom webpack config)

   ```
   npm start
   ```

3. Build the production version:

   ```
   npm run build
   ```

4. Upload the built files to DigitalOcean Spaces:

   - The built files should be uploaded to a DigitalOcean Space called "linus-mimietz-com-memes-react"
   - Ensure that the CORS settings of the Space are configured (url is listed and all header `*` allowed)
   - Clear CDN cache multiple times if you're replacing a previous version

5. Update Webflow integration:

   - In your Webflow project, update the filenames of the JS and CSS files where the app is imported
   - The new filenames can be found in the `build` folder after running `npm run build`

   ```
   <div id="react-root-meme-app"></div>
   <script src="https://linus-mimietz-com-memes-react.fra1.cdn.digitaloceanspaces.com/static/js/main.9636209d.js"></script>
   <link rel="stylesheet" type="text/css" href="https://linus-mimietz-com-memes-react.fra1.cdn.digitaloceanspaces.com/static/css/main.71e6b16b.css">
   ```

## Configuration

The project uses custom webpack configuration to ensure proper CSS scoping and output file naming. This is implemented in the `config-overrides.js` file.

## Note on File Hosting

All meme files (images and videos) should be uploaded to the DigitalOcean Space "linus-mimietz-com-memes". The application is configured to fetch memes from this location.
