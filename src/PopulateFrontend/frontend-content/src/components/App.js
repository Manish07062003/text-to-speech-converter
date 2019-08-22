import React, { Component } from 'react';
import { API } from 'aws-amplify';
import Form from './Form';
import Table from './Table';

import '../styles/App.css';

class App extends Component {
  constructor () {
    super();
    this.state = {
      rows: [],
      formData: {
        voice: '',
        text: ''
      },
      message: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  async componentDidMount () {
    try {
      const { Items } = await API.get('backend', '/file');
      this.setState({ rows: Items });
    } catch (err) {
      console.error(err);
    }
  }

  handleChange (event) {
    this.setState({
      formData: {
        ...this.state.formData,
        [event.target.name]: event.target.value
      }
    });
  }

  async handleSubmit (event) {
    event.preventDefault();

    if (this.state.formData.text === '') {
      this.setState({ message: 'Please enter some text before submitting' });
      return;
    }

    this.setState({ message: 'Loading...' });

    try {
      const result = await API.post('backend', '/file', { body: this.state.formData });

      this.setState({
        rows: [
          result,
          ...this.state.rows
        ],
        formData: {
          voice: '',
          text: ''
        },
        message: ''
      });
    } catch (err) {
      this.setState({ message: `An error occurred: ${err.message}` });
      console.error(err);
    }
  }

  async handleDelete (id) {
    const deleteConfirm = window.confirm('Do you really want to delete?');
    if (!deleteConfirm) {
      return;
    }

    try {
      await API.del('backend', `/file/${id}`);

      const index = this.state.rows.findIndex(obj => obj.id === id);
      this.setState({
        rows: [
          ...this.state.rows.slice(0, index),
          ...this.state.rows.slice(index + 1)
        ]
      });
    } catch (err) {
      alert(`An error occurred: ${err.message}`);
      console.error(err);
    }
  }

  render () {
    return (
      <div className='container'>
        <h1>Text to speech converter</h1>
        <Form
          onSubmit={this.handleSubmit}
          onChange={this.handleChange}
          formData={this.state.formData}
          message={this.state.message}
        />
        <Table
          rows={this.state.rows}
          onDelete={this.handleDelete}
        />
      </div>
    );
  }
}

export default App;
