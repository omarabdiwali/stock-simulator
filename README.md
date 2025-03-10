# Stonks - A Stock Portfolio Tracker

Stonks is a web application built with Next.js, React, and Tailwind CSS that allows users to track their stock and cryptocurrency investments and view detailed stock charts.  It uses NextAuth.js for session management and the Finnhub.io API for financial data.  It also incorporates notistack for user notifications.

### **Website: https://stocksimulator.vercel.app**

## Features

*   **Portfolio Overview (index.js):** Displays the user's total portfolio value, available cash, total assets, and a detailed table of individual stock holdings.  The table includes the purchase date, purchase price, current price, amount owned, and profit/loss for each stock.  Users can sort the table by various criteria (symbol, date, purchase amount, etc.) and filter by symbol.  A "Sell" modal (using a custom `SellModal` component) allows users to sell their holdings.
*   **Stock and Crypto Search ([value].js):** Allows users to search for stocks and cryptocurrencies.  Displays a list of matching results, differentiating between stocks and cryptocurrencies.  Uses a custom `Stock` component to display search results.
*   **API Key Management (GetKey component):** Prompts the user to enter their Finnhub API key if one is not already stored.  This key is essential for fetching financial data.
*   **Authentication (via NextAuth.js):** Requires users to be authenticated to access the portfolio and stock information.  Redirects unauthenticated users to the login page.
*   **Data Loading and Error Handling:** Uses spinners to indicate loading states and handles potential API errors (e.g., invalid stock symbol, missing API key).
*   **Responsive Design:** Adapts to different screen sizes with layout adjustments.
* **Precision Handling:** Uses `toFixed` in the stock chart component.


## File Structure (Relevant Files)

*  **`pages/index.js` (Home):**  The main portfolio overview page.  It displays the total portfolio value, available cash, total assets, and a table of stock holdings with sorting and filtering capabilities.
*  **`pages/symbol/[stock].js` (not in use):** Displays the candlestick chart for a specific stock, along with buy functionality.  The `[stock]` part of the filename indicates a dynamic route, using the stock symbol as a parameter (e.g., `/symbol/AAPL`).
*  **`pages/search/[value].js`:** Handles searching for stocks and cryptocurrencies. The `[value].js` filename uses a dynamic route parameter to take search data from the URL.
*  **`components/toolbar.js`**: The app's navigation toolbar.
*  **`components/sellModal.js`**: A sell modal component for selling stocks.
*  **`components/getKey.js`**: A form to save a user's Finnhub API key.
*  **`componenets/spinner.js`**: A spinner component to display while asynchronous operations are pending.
*  **`componenets/stock.js`**: A stock component for showing a stock to a user.
*  **`pages/api/price.js`:**  An API route that fetches the current price of a stock or cryptocurrency, proxying requests to Finnhub.
*  **`pages/api/stocks/get.js`:** An API route that retrieves the user's stored stock data (including the Finnhub API key).
*  **`pages/api/stocks/buy.js`:** An API route that handles buying stocks, updating the user's portfolio.
*  **`pages/api/search.js`:** An API route that allows users to search a database for a cryptocurrency or stock.

## Dependencies

*   **Next.js:** React framework for server-rendered applications.
*   **React:** JavaScript library for building user interfaces.
*   **Tailwind CSS:** Utility-first CSS framework.
*   **NextAuth.js:** Authentication library for Next.js.
*   **notistack:** Notification library for React.
*   **react-apexcharts (not in use):** React wrapper for ApexCharts.js (for candlestick charts).
*   **react-icons:** Library of popular icons, used for the "Sell" button and the "Reverse Table" button.
*   Other Dependencies (useState, useRouter, useEffect)

## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/omarabdiwali/stock-simulator.git
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Authentication:**
    *   Set up NextAuth.js according to its documentation. This likely involves creating environment variables for authentication providers (e.g., Google, GitHub).

4.  **Configure Database Access to the user:**
    * Implement a way to save user data. `pages/api/stocks/get` and `pages/api/stocks/buy` must be edited to fetch and save to the user's database.

5.  **Configure Database Searching:**
    * Implement a way to read through search for stocks.

6. **Set Environment Variables:**

    Create a `.env.local` file in the root of your project and add the following: You will need to add valid values.

    ```
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000  # Or your deployment URL
    # Add other environment variables for your authentication provider (e.g., Google Client ID, Google Client Secret, MongoDB Uri)
    ```

    Replace placeholders (e.g., `your_nextauth_secret`) with appropriate values.  The `NEXTAUTH_SECRET` should be a strong, randomly generated string.

7.  **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

8.  **Open in your browser:**

    Open `http://localhost:3000` in your web browser.

## API Routes

The application uses several API routes within the `pages/api` directory:

*   `/api/price`:  Fetches the price of a given stock or cryptocurrency.  Expects a POST request with a JSON body containing `stock` (the symbol) and `kind` (e.g., "stock" or "crypto").
*   `/api/stocks/get`:  Retrieves the user's stock data and API key.
*   `/api/stocks/buy`: Handles the purchase of stocks. Expects a POST request with a JSON body specifying the `stock` symbol and `amount`.
* '/api/search': Handles searching stocks and crypto. Expects a POST.

These API routes interact with the Finnhub API and handle data persistence using a MongoDB database.

## Usage

1.  **Authentication:** The user needs to be logged in to use the application.
2.  **API Key Input:** Upon first use (or if no API key is stored), the user will be prompted to enter their Finnhub API key.
3.  **Portfolio Overview:** The main page (`/`) shows the user's portfolio, including total value, cash balance, assets, and a sortable/filterable table of holdings.
4.  **Search:** Use /search and then the query in the URL to search something.