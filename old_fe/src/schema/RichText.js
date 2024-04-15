import React, { Component } from 'react';
import TinyMCE from 'react-tinymce';
class RichText extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: !props.value,
            schema: props.schema
        };
    }
    handleEditorChange(e) {
        let val = e.target.getContent();
        this.setState({ value: val });
        if (this.props.onChange) {
            this.props.onChange(val);
        }

    }
    componentWillReceiveProps(next) {
        this.setState({ value: next.value });
    }

    render() {
        return (<div>
            <TinyMCE
                content={this.props.value}
                config={{
                    readonly: this.props.disabled,
                    plugins: 'fullpage autolink link image lists print preview code directionality contextmenu emoticons textcolor colorpicker hr wordcount insertdatetime table paste searchreplace',
                    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code | searchreplace | ltr rtl | emoticons | forecolor backcolor | hr',
                    menubar: 'file edit insert view format table tools help',
                    contextmenu: "link image inserttable | cell row column deletetable",
                    wordcount_cleanregex: /[0-9.(),;:!?%#$?\x27\x22_+=\\\/\-]*/g,
                    wordcount_countregex: /[\w\u2019\x27\-\u00C0-\u1FFF]+/g,
                    height: +(this.state.schema.numberOfLine || 5) * 20 + 100,
                    min_height: 100
                }}
                onChange={this.handleEditorChange.bind(this)}
            />
        </div>)
    }
}

export default RichText;
