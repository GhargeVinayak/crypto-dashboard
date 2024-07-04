import React, { Component } from 'react'; // Import React and Component from the 'react' library
import './App.css'; // Import the CSS file for styling

class App extends Component {
  constructor(props) {
    super(props);
    // Initialize the state with an empty array for cryptos and a timer set to 60 seconds
    this.state = {
      cryptos: [],
      timer: 60,
    };
  }

  // Lifecycle method called once the component is mounted
  componentDidMount() {
    this.fetchCryptos(); // Fetch cryptocurrency data initially
    // Set interval to fetch data every minute
    this.dataFetchInterval = setInterval(this.fetchCryptos, 60000);
    // Set interval to update the timer every second
    this.timerInterval = setInterval(this.updateTimer, 1000);
  }

  // Lifecycle method called before the component is unmounted
  componentWillUnmount() {
    // Clear the intervals to prevent memory leaks
    clearInterval(this.dataFetchInterval);
    clearInterval(this.timerInterval);
  }

  // Method to fetch cryptocurrency data from the backend API
  fetchCryptos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cryptos'); // Fetch data from the API
      const data = await response.json(); // Parse the JSON response
      // Update the state with the fetched data and reset the timer to 60 seconds
      this.setState({ cryptos: data, timer: 60 });
    } catch (error) {
      console.error('Error fetching data:', error); // Log any errors to the console
    }
  };

  // Method to update the timer every second
  updateTimer = () => {
    // Update the timer in the state, resetting it to 60 if it reaches 0
    this.setState(prevState => ({
      timer: prevState.timer > 0 ? prevState.timer - 1 : 60
    }));
  };

  render() {
    const { cryptos, timer } = this.state; // Destructure state variables for easy access

    return (
      <div className="App">
        <header className="App-header">
          <h1>Cryptocurrency Dashboard</h1>
          <p>Next update in: {timer} seconds</p> {/* Display the timer */}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Last</th>
                <th>Buy</th>
                <th>Sell</th>
                <th>Volume</th>
                <th>Base Unit</th>
              </tr>
            </thead>
            <tbody>
              {cryptos.map(crypto => (
                <tr key={crypto.name}>
                  <td>{crypto.name}</td>
                  <td>{crypto.last}</td>
                  <td>{crypto.buy}</td>
                  <td>{crypto.sell}</td>
                  <td>{crypto.volume}</td>
                  <td>{crypto.base_unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </header>
      </div>
    );
  }
}

export default App; // Export the App component as the default export
