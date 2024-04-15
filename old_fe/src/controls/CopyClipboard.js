import React, { Component } from 'react';
import {
    Button, Popover, PopoverHeader, PopoverBody
} from 'reactstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import idGenerator from 'react-id-generator';
class CopyClipboard extends Component {
    constructor(props) {
        super(props);
        this.state = { cpyInviteCode: false, id: idGenerator('cpy-clipboard-btn') };
    }
    render() {
        return (<div>
            <CopyToClipboard text={this.props.text}
                onCopy={() => {
                    this.setState({ cpyInviteCode: true });
                }}>
                <Button id={this.state.id} color='primary'>Sao chép</Button>
            </CopyToClipboard>
            <Popover placement="bottom" isOpen={this.state.cpyInviteCode} target={this.state.id} toggle={e => { this.setState({ cpyInviteCode: false }) }}>
                <PopoverHeader>Sao chép</PopoverHeader>
                <PopoverBody>Đã sao chép vào bộ nhớ.</PopoverBody>
            </Popover>
        </div>
        )
    }
}

export default CopyClipboard;
