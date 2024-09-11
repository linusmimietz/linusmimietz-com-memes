# Memes React App

This project is a React-based web application for viewing and liking memes.

## Features

- View memes (images and videos)
- Like memes
- Randomized meme order (always starting with filename "start" if it exists)
- Responsive design
- Animated like button
- Keyboard navigation
- Progress tracking
- End summary screen
- Caching state locally and merging with server data on load

## Technologies Used

- React
- TypeScript
- Ant Design

## Database & Backend

The backend provides two main endpoints:

1. `/get_all`: Retrieves all documents from the "likes" table.
2. `/increment_one`: Increments the like count for a specific meme.

The backend code can be found in the `memes-flask-backend` folder.

## Key Components

1. `App.tsx`: Main application component
2. `api.tsx`: API functions for interacting with the Flask backend and fetching memes
3. `ButtonComponent.tsx`: Reusable button component with animation support

## Key Libraries Used

1. `axios`: Used for making HTTP requests to the Flask backend and DigitalOcean Spaces APIs
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

   - Comment out the custom webpack config in `webpack.config.js` before running locally, otherwise the url will be rewritten to the DigitalOcean Space

   ```
   npm start
   ```

3. Build the production version:

   ```
   npm run build
   ```

4. Upload the built files to DigitalOcean Spaces:

   - The built files should be uploaded to a DigitalOcean Space called "linus-mimietz-com-memes-react" as public
   - Ensure that the CORS settings of the Space are configured (url is listed and all header `*` allowed)
   - Clear CDN cache multiple times if you're replacing a previous version

5. Update Webflow integration:

   - On the webflow site, the app is integrated via a Code Embed
   - Update the filenames of the JS and CSS everytime a new build is created

   ```html
   <div id="react-root-meme-app"></div>
   <script src="https://linus-mimietz-com-memes-react.fra1.cdn.digitaloceanspaces.com/static/js/main.9636209d.js"></script>
   <link rel="stylesheet" type="text/css" href="https://linus-mimietz-com-memes-react.fra1.cdn.digitaloceanspaces.com/static/css/main.71e6b16b.css" />
   ```

## Configuration

The project uses custom webpack configuration to ensure proper CSS scoping and output file naming. This is implemented in the `config-overrides.js` file. The custom webpack configuration in `webpack.config.js` rewrites the public path to the DigitalOcean Space URL. This is necessary for the production build to correctly reference the assets hosted on DigitalOcean Spaces.

## Note on File Hosting

All meme files (images and videos) should be uploaded to the DigitalOcean Space "linus-mimietz-com-memes" as public. The application is configured to fetch memes from this location.
