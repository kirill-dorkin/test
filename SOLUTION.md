# SOLUTION.md

## Backend

### Refactor blocking I/O

* Replaced `fs.readFileSync`/`fs.writeFileSync` with `fs.promises.readFile`/`writeFile`.
* Converted route handlers to `async/await`.

### Performance

* Cached statistics in memory keyed by file `mtimeMs`.
* Recomputed only when `data/items.json` modification time changes.

### Testing

* Added Jest + Supertest tests for `/api/items`:

  * GET all items, search, limit.
  * GET by id (found/404).
  * POST create and error handling.
* Tests run with `npm test` in `backend`.

## Frontend

### Memory Leak

* Used `AbortController` to cancel fetch when `Items` unmounts.

### Pagination & Search

* Extended backend `/api/items` to accept `q`, `page`, `limit`.
* Updated `DataContext` and `Items.js` to pass query params and handle paginated response.

### Virtualization

* Integrated `react-window` for rendering large lists.

### UI/UX Polish

* Added skeleton loaders for list items.
* Implemented accessible markup (`aria-*`, `role` attributes).
* Styled search input, list, buttons; added visible pagination controls.

## Trade-offs & Further Improvements

* Payload validation and schema enforcement omitted (TODO).
* Concurrent write safety and transactional integrity not addressed.
* No rate limiting or authentication implemented.
* End-to-end tests and integration tests can be added.
* Consider using a database for scalability and consistency.
