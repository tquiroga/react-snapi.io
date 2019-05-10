import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class Snapi extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isValidNumber: false,
      displayErrorMessage: false,
      loading: false,
      isCompleted: false,
      snap_key: '',
    };
  }

  componentDidMount() {
    this.setState({ isValidNumber: this.checkIfNumberIsValid() });
  }

  checkIfNumberIsValid = () =>
    this.props.phoneNumber.match(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
    );

  onSnapClick = () => {
    if (this.checkIfNumberIsValid()) {
      this.setState({ displayErrorMessage: false });
      const { phoneNumber, apiKey } = this.props;
      this.setState({ loading: true });
      axios
        .post('/api/v1/snap/new_snap', {
          phoneNumber,
          apiKey,
          domain: window.location.origin,
        })
        .then(res => {
          this.setState({ snap_key: res.data });
          window.snapStatus = setInterval(this.fetchSnapStatus, 3000);
        })
        .catch(err => err.message);
    } else {
      this.setState({ displayErrorMessage: true, loading: false });
    }
  };

  fetchSnapStatus = () => {
    axios
      .get(`/api/v1/snap/${this.state.snap_key}/status`)
      .then(res => {
        if (res.data !== 0) {
          const { mimeType, image } = res.data;
          this.setState({ loading: false, isCompleted: true });
          const imgSrc = `data:${mimeType};base64, ${image}`;
          this.props.onPictureUploaded(imgSrc);
          // @TODO see if we do a File instead
          document.getElementsByName('imageData')[0].setAttribute('value', imgSrc);
          if (this.props.showImage) {
            const img = new Image();
            img.src = `data:${mimeType};base64, ${image}`;
            imgElem.setAttribute('src', img.src);
          }
          clearInterval(snapStatus);
        }
      })
      .catch(err => err.message);
  };

  renderBasicButton = () => {
    return (
      <div>
        {this.props.renderButton
          ? <div onClick={this.onSnapClick}>
              {this.props.renderButton}
            </div>
          : <button type="button" className="btn btn-success" onClick={this.onSnapClick}>
              <span>
                {this.props.buttonText}
              </span>
            </button>}
      </div>
    );
  };

  renderCustomInputGroupButton = () => {
    return (
      <div>
        {this.props.renderButton
          ? <div className="input-group">
              {this.props.renderPhoneNumberInput}
              <div className="input-group-append" onClick={this.onSnapClick}>
                {this.props.renderButton}
              </div>
            </div>
          : <div className="input-group">
              {this.props.renderPhoneNumberInput}
              <div className="input-group-append" onClick={this.onSnapClick}>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={this.onSnapClick}
                >
                  <span>
                    {this.props.buttonText}
                  </span>
                </button>
              </div>
            </div>}
      </div>
    );
  };

  renderBasicInputGroupButton = () => {
    return (
      <div>
        <div className="input-group">
          <input
            type="tel"
            className="form-control"
            id="phoneNumber"
            name="phoneNumber"
            placeholder={this.props.phoneInputLabel}
            value={this.props.phoneNumber}
            onChange={this.props.onPhoneNumberChange}
            {...this.props.phoneInputProps}
            required
          />

          {this.props.renderButton
            ? <div className="input-group-append" onClick={this.onSnapClick}>
                {this.props.renderButton}
              </div>
            : <div className="input-group-append">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={this.onSnapClick}
                >
                  <span>
                    {this.props.buttonText}
                  </span>
                </button>
              </div>}
        </div>
      </div>
    );
  };

  renderInputGroupButton = () => {
    return this.props.renderPhoneNumberInput
      ? this.renderCustomInputGroupButton()
      : this.renderBasicInputGroupButton();
  };

  renderLoadingButton = () => {
    return (
      <div>
        {this.props.renderLoadingButton
          ? this.props.renderLoadingButton
          : <button type="button" className="btn btn-success" disabled>
              {this.props.renderSpinner && this.props.renderSpinner()}
              <div>
                {this.props.loadingText}
              </div>
            </button>}
      </div>
    );
  };

  renderCompletedButton = () => {
    return (
      <div>
        {this.props.renderSuccessButton
          ? <div>
              <div onClick={this.onSnapClick}>
                {this.props.renderSuccessButton}
              </div>
            </div>
          : <button type="button" className="btn btn-success" onClick={this.onSnapClick}>
              {this.props.showImage
                ? <div className="container mx-2" style={{ width: '150px' }}>
                    <img id="imgElem" className="img-thumbnail" />
                  </div>
                : <div>
                    <i className="fa fa-check fa-2x" aria-hidden="true" />
                  </div>}
              <div>
                {this.props.successText}
              </div>
            </button>}
        <input type="hidden" name="imageData" />
      </div>
    );
  };

  renderError = () => {
    return (
      <div>
        {this.state.displayErrorMessage
          ? <div>
              {this.props.renderErrorMessage
                ? <div>
                    {this.props.renderErrorMessage}
                  </div>
                : <div className="text-danger">
                    <i className="fa fa-times-circle mr-2" />
                    <small>
                      {this.props.errorText}
                    </small>
                  </div>}
            </div>
          : <div />}
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.state.loading
          ? this.renderLoadingButton()
          : <div>
              {this.state.isCompleted
                ? this.renderCompletedButton()
                : <div>
                    {this.state.isValidNumber
                      ? this.renderBasicButton()
                      : this.renderInputGroupButton()}
                  </div>}
            </div>}
        {this.renderError()}
      </div>
    );
  }
}

Snapi.propTypes = {
  apiKey: PropTypes.string.isRequired,
  phoneNumber: PropTypes.string,
  showImage: PropTypes.bool,
  buttonText: PropTypes.string,
  renderButton: PropTypes.object,
  phoneInputLabel: PropTypes.string,
  renderPhoneNumberInput: PropTypes.object,
  phoneInputProps: PropTypes.object,
  renderSpinner: PropTypes.object,
  loadingText: PropTypes.string,
  renderLoadingButton: PropTypes.object,
  successText: PropTypes.string,
  renderSuccessButton: PropTypes.object,
  errorText: PropTypes.string,
  renderErrorMessage: PropTypes.object,
  onPhoneNumberChange: PropTypes.func,
  onPictureUploaded: PropTypes.func.isRequired,
};

export default Snapi;
