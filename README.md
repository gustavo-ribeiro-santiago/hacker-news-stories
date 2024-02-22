# Hacker News React App
This React application provides a user-friendly interface for exploring the Hacker News stories. Users can filter by date and by tags, sort by different criteria, search for keywords and navigate through paginated results. The app also allows the users to view nested comments associated with each story.

![Project Screenshot](hacker%20news%20stories%20printshot.png)

## Features
- Search Functionality: Use the search bar to find stories related to specific keywords.
- Sorting: Users can sort the news stories based on either date or relevance.
- Filtering: The application supports filtering by date range and tags.
- Comments: Expand and collapse nested comments associated with each story.
- Pagination: Navigate through different pages of search results.
- Responsive Design: The interface is designed to be responsive, adapting to different screen sizes.

## How to Run

Access web app [here](https://gustavo-ribeiro-santiago.github.io/hacker-news-stories/) or clone this repository to run it on your local machine.

## Technologies Used
- React
- React Bootstrap
- Material-UI (for date pickers)
- Axios (for API requests)
- Day.js (for handling dates)

## Components
### App.js

The main component that orchestrates the overall structure of the application. It handles state, API requests, and renders child components.

### FilterBySection.jsx

Manages the filter options, including date range and tags. Uses Material-UI date pickers for date selection.

### SortBySection.jsx

Handles the sorting options, allowing users to choose between sorting by date or relevance.

### NewsStories.jsx

Renders the list of news stories based on the current page. Provides an option to show/hide comments for each story.

### Comments.jsx

Displays comments for each news story. Comments are fetched asynchronously to enhance performance.

### Subcomments.jsx

Displays subcomments recursively for a given comment.

### Pagination.jsx

Renders page navigation buttons based on the number of available pages.

## Development Tips
- Debouncing Search: The app uses debouncing to avoid making too many API calls while the user is typing in the search bar.
- Comments Fetching: Comments associated with each story are fetched asynchronously to enhance performance.
- Pagination: The app employs pagination to display a limited number of stories per page.

## Roadmap of future improvements

- Generate AI images associated with each news story

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
Gustavo Ribeiro Santiago

Email: gustavorsa@poli.ufrj.br

GitHub: https://github.com/gustavo-ribeiro-santiago

Feel free to reach out if you have any questions or feedback!

Please review these additional resources to continue learning:

- [Strapi Documentation](https://strapi.io/documentation/developer-docs/latest/getting-started/introduction.html)
- [Strapi Discord Community](https://discord.com/invite/strapi)
- [Strapi GitHub](https://github.com/strapi/strapi)
- [Strapi Quickstart Guide](https://strapi.io/documentation/developer-docs/latest/getting-started/quick-start.html#_1-install-strapi-and-create-a-new-project)
- [Postman Learning Center](https://learning.postman.com/)
- [Explore Postman Public API Network](https://www.postman.com/explore)
- [Postman Community](https://community.postman.com/)
- [Express GitHub](https://github.com/expressjs/express)
- [NodeJS Documentation](https://nodejs.org/en/docs/)
- [Picsum Photos](https://picsum.photos/)