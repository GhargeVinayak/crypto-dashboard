import React, { Component } from 'react';
import './App.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cryptos: [],
      timer: 60,
      darkMode: false,
    };
  }

  componentDidMount() {
    this.fetchCryptos();
    this.dataFetchInterval = setInterval(this.fetchCryptos, 60000);
    this.timerInterval = setInterval(this.updateTimer, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.dataFetchInterval);
    clearInterval(this.timerInterval);
  }

  fetchCryptos = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cryptos');
      const data = await response.json();
      this.setState({ cryptos: data, timer: 60 });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  updateTimer = () => {
    this.setState(prevState => ({
      timer: prevState.timer > 0 ? prevState.timer - 1 : 60
    }));
  };

  toggleDarkMode = () => {
    this.setState(prevState => ({
      darkMode: !prevState.darkMode
    }));
  };

  render() {
    const { cryptos, timer, darkMode } = this.state;
    const percentage = (timer / 60) * 100;

    return (
      <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <header className="App-header">
          <h1>Cryptocurrency Dashboard</h1>
          <div className='timer-mode'>
            <div style={{ width: '50px', margin: '10px auto' }}>
              <CircularProgressbar
                value={percentage}
                text={`${timer}s`}
                styles={buildStyles({
                  pathColor: darkMode ? '#ffffff' : '#000000',
                  textColor: darkMode ? '#ffffff' : '#000000',
                  trailColor: darkMode ? '#333333' : '#dddddd',
                })}
              />
            </div>
            <button onClick={this.toggleDarkMode}>
              Switch to {darkMode ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </header>
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
      </div>
    );
  }
}

export default App;
