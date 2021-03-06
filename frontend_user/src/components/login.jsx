import React, { Component } from "react";
import "./contentView.css";
import firebase from "firebase/app";
import "firebase/auth";

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      number: "",
      error: null,
      waitingForCode: false,
      disabled: false
    };
  }

  update = e => {
    this.setState({
      number: e.target.value
    });
  };

  login = () => {
    this.setState({ error: null, disabled: true }, () => {
      if (this.state.number.length === 10) {
        firebase
          .auth()
          .signInWithPhoneNumber(
            `+1${this.state.number}`,
            window.recaptchaVerifier
          )
          .then(confirmationResult => {
            this.setState({
              number: "",
              waitingForCode: true,
              disabled: false
            });
            window.confirmationResult = confirmationResult;
          })
          .catch(error => {
            this.setState({ error: error.message, disabled: false });
          });
      } else {
        this.setState({ error: "Enter a valid number", disabled: false });
      }
    });
  };

  submitCode = () => {
    this.setState({ error: null, disabled: true }, () => {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        window.confirmationResult.verificationId,
        this.state.number
      );
      firebase
        .auth()
        .signInWithCredential(credential)
        .catch(err =>
          this.setState({
            disabled: false,
            error: err.message,
            number: "",
            waitingForCode: false
          })
        );
    });
  };

  render() {
    return (
      <div className="contentViewWrapperBackground">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "1px solid #333333",
            height: "fit-content",
            width: "18em",
            borderRadius: 8,
            padding: "1em"
          }}
        >
          <h2 style={{ color: "white" }}>Log In To TextBox</h2>
          <img
            alt="Textbox logo"
            src="/logo.png"
            style={{ padding: 4, height: 70, marginRight: 16 }}
          />
          <h4 style={{ color: "white" }}>
            {this.state.disabled
              ? "Loading..."
              : this.state.waitingForCode
              ? "Enter Confirmation Code"
              : "Enter Your 10 Digit Phone Number"}
          </h4>
          {this.state.error && (
            <div className="error">
              <div style={{ color: "red" }}>{this.state.error}</div>
            </div>
          )}
          <form
            action="#"
            onSubmit={() => {
              this.state.waitingForCode ? this.submitCode() : this.login();
            }}
          >
            <input
              name="number"
              placeholder={this.state.waitingForCode ? "555555" : "5555555555"}
              onChange={e =>
                e.target.value.length <= 10 &&
                this.setState({ number: e.target.value })
              }
              disabled={this.state.disabled}
              value={this.state.number}
              className="inputNumber"
            />
          </form>

          <button
            style={{
              margin: "1.5rem",
              outline: "none",
              border: "1px solid #5cc0ff",
              backgroundColor: this.state.disabled ? "lightgray" : "#5cc0ff",
              height: "2.5em",
              width: "14rem",
              borderRadius: 25,
              cursor: "pointer"
            }}
            disabled={this.state.disabled}
            onClick={() =>
              this.state.waitingForCode ? this.submitCode() : this.login()
            }
          >
            Submit
          </button>
        </div>
      </div>
    );
  }
}
