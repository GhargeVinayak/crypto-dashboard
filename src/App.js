import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cryptos: [],
      timer: 60,
    };
  }

  componentDidMount() {
    this.fetchCryptos();
    this.dataFetchInterval = setInterval(this.fetchCryptos, 60000); // Refresh data every minute
    this.timerInterval = setInterval(this.updateTimer, 1000); // Update timer every second
  }

  componentWillUnmount() {
    clearInterval(this.dataFetchInterval);
    clearInterval(this.timerInterval);
  }

  fetchCryptos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cryptos');
      const data = await response.json();
      this.setState({ cryptos: data, timer: 60 }); // Reset timer to 60 after fetching data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  updateTimer = () => {
    this.setState(prevState => ({
      timer: prevState.timer > 0 ? prevState.timer - 1 : 60
    }));
  };

  render() {
    const { cryptos, timer } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1>Cryptocurrency Dashboard</h1>
          <p>Next update in: {timer} seconds</p>
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

export default App;
