# Hacker News React App
This React application provides a user-friendly interface for exploring the latest Hacker News stories. Users can search for specific topics and navigate through paginated results. The app also includes a feature to display comments and subcomments associated with each story.

## Features
- Search Functionality: Use the search bar to find stories related to specific keywords.
- Pagination: Navigate through different pages of search results.
- Comments: Expand and collapse comments and subcomments associated with each story.

## How to Run

Access web app [here](https://gustavo-ribeiro-santiago.github.io/hacker-news-stories/) or clone this repository to run it on your local machine.

## Dependencies
- React: A JavaScript library for building user interfaces.
- React Bootstrap: Bootstrap components as React components.
- Axios: Promise-based HTTP client for the browser and Node.js.

## Components
### App.js
Main component containing the application logic.

### NewsStories.jsx
Component for rendering the list of news stories.

### Comments.jsx
Component for displaying comments associated with a news story.

### Subcomments.jsx
Component for displaying nested subcomments

### Pagination.jsx
Component for rendering pagination controls.

### useDataApi.js
Custom hook for managing API calls and state.

## Development Tips
- Debouncing Search: The app uses debouncing to avoid making too many API calls while the user is typing in the search bar.
- Comments Fetching: Comments associated with each story are fetched asynchronously to enhance performance.
- Pagination: The app employs pagination to display a limited number of stories per page.

## Roadmap of future improvements

- Include filters by date and by tags
- Include sort by date or by relevance
- Generate AI images associated with each news story

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
Gustavo Ribeiro Santiago

Email: gustavorsa@poli.ufrj.br

GitHub: https://github.com/gustavo-ribeiro-santiago

Feel free to reach out if you have any questions or feedback!