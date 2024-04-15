import React, { Component } from "react";
import { Button } from "reactstrap";
import ReactModal from "react-modal";
import { connect } from "react-redux";
import VoucherApproveCtrl from "./VoucherApproveCtrl";
import SyncVoucherCtrl from "./SyncVoucherCtrl";
import FormCtrl from "./FormCtrl";
import VoucherPreview from "./VoucherPreview";
ReactModal.setAppElement("#root");
ReactModal.defaultStyles.overlay.backgroundColor = "rgba(0, 0, 0, 0.6)";
class ModalControl extends Component {
  onClose(modal) {
    this.props.dispatch({ type: "HIDE_MODAL", data: modal });
    setTimeout(() => {
      this.props.dispatch({ type: "POP_MODAL", data: modal });
    }, 300);
  }
  render() {
    if (!this.props.modals) return null;
    let content = null;
    return (
      <React.Fragment>
        {this.props.modals.map((modal, index) => {
          let buttons = [];
          switch (modal.type) {
            case "message":
              buttons = [
                <Button
                  key={1}
                  color="secondary"
                  onClick={() => {
                    this.onClose(modal);
                  }}
                >
                  Close
                </Button>,
              ];
              content = (
                <React.Fragment>
                  {modal.content && modal.content.startsWith("<html>") ? (
                    <div className="text-wrap" dangerouslySetInnerHTML={{ __html: modal.content.replace('<html>',"").replace('</html>','') }} />
                  ) : (
                    <p className="text-wrap">{modal.content}</p>
                  )}
                  {buttons}
                </React.Fragment>
              );
              break;
            case "confirm":
              buttons = [
                <Button
                  color="secondary"
                  key={1}
                  onClick={() => {
                    this.onClose(modal);
                    if (modal.cb && typeof modal.cb === "function") {
                      modal.cb(0);
                    }
                  }}
                >
                  Cancel
                </Button>,
                <Button
                  className="ml-3"
                  color="primary"
                  key={2}
                  onClick={() => {
                    this.onClose(modal);
                    if (modal.cb && typeof modal.cb === "function") {
                      modal.cb(1);
                    }
                  }}
                >
                  OK
                </Button>,
              ];
              content = (
                <React.Fragment>
                  <p className="text-wrap">{modal.content}</p>
                  {buttons}
                </React.Fragment>
              );
              break;
            case "preview":
              content = (
                <div className="form-modal-container">
                  <VoucherPreview query={modal.props} />
                </div>
              );
              break;
            case "voucherApprove":
              content = (
                <div className="form-modal-container">
                  <VoucherApproveCtrl query={modal.props} />{" "}
                </div>
              );
              break;
            case "sync":
              content = (
                <div className="form-modal-container">
                  <SyncVoucherCtrl query={modal.props} />{" "}
                </div>
              );
              break;
            case "form":
            default:
              content = (
                <div className="form-modal-container">
                  <FormCtrl query={modal.props} />{" "}
                </div>
              );
              break;
          }
          return (
            <ReactModal
              shouldCloseOnOverlayClick={false}
              closeTimeoutMS={200}
              key={index}
              isOpen={modal.show}
              style={{
                content: {
                  top: "0",
                  left: "50%",
                  right: "auto",
                  bottom: "auto",
                  marginRight: "-50%",
                  transform: "translate(-50%, 0)",
                  overlfow: "scroll",
                  background: "transparent",
                  border: "none",
                  zIndex: "2000",
                },
              }}
              // onAfterOpen={this.afterOpenModal}
              onRequestClose={() => {
                this.onClose(modal);
              }}
            >
              <div className="modal-container">
                <div className="modal-head">
                  <p>Inform</p>
                  <span
                    onClick={() => {
                      this.onClose(modal);
                    }}
                  >
                    X
                  </span>
                </div>
                {content}
              </div>
            </ReactModal>
          );
        })}
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => {
  return { modals: state.modals };
};
export default connect(mapStateToProps)(ModalControl);
