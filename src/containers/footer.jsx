import React, { Component } from 'react'
import { FormGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom';

class Footer extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }


  render() {
    return (
      <div id="footer">
        {/* <Link to="/jay">Jay</Link>
        <Link to="/ruslan">Ruslan</Link>
        <Link to="/yiyang">YiYang</Link> */}
        {/* <a href="">JAY</a>
        <a href="">RUSLAN</a>
        <a href="">YIYANG</a> */}
      </div>
    )
  }
}

export default Footer;