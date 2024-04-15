import React, { Component } from 'react';
import { Button, Col, Row, Modal, ModalBody, ModalFooter, Card, CardBody, CardGroup, CardHeader } from 'reactstrap';
import helper from '../services/helper';
import FormSchema from '../schema';
import Local from '../services/local';
import Loader from './Loader';
import ListCtrl from './ListCtrl'
import _ from 'lodash'
export default class FormCtrl extends Component {
  constructor(props) {
    super(props);
    this.query = props.query
    // let data = helper.parseQueryData(this.props.query.embed);
    this.state = {
      data: null,
      pageInfo: null,
      error: null,
      loading: true
    }
  }
  componentDidMount() {
    this.loadData();
  }
  componentWillReceiveProps(next) {
    // console.log({ next })

    if (!_.isEqual(next, this.props)) {
      // console.log({ next })

      this.loadData(next);
    }
  }
  async loadData(props) {
    if (!props) props = this.props;
    let pageInfo = await helper.getPage(props.query.page);
    // console.log('PAGE INFO', pageInfo);
    this.setState({
      pageInfo,
      mode: props.query.mode
    });
    if (props.query.mode === 'edit') {
      if (!props.query.id) {
        return this.setState({ error: 'Không có thông tin để tải dữ liệu' })
      }
      let rs = await helper.callPageApi(pageInfo, pageInfo.read, Object.assign(props.query, { queryInput: JSON.stringify({ id: props.query.id }) }));
      if (!rs.data[0]) {
        return helper.alert('Nội dung truy cập không khả dụng!')
      }
      let data = rs.data[0];
      let embed = helper.parseQueryData(props.query.embed)
      if (embed) {
        Object.assign(data, embed);
      }
      this.setState({ data })
    } else {
      let data = {};
      pageInfo.schema.map(i => {
        data[i.field] = null;
      });
      let embed = helper.parseQueryData(props.query.embed)
      if (embed) {
        Object.assign(data, embed);
      }
      this.setState({ data });
    }

  }
  async onSubmit() {
    this.onButtonClick();
  }

  async onButtonClick(btnInfo) {
    if (!btnInfo) {
      for (var i = 0; i < this.state.pageInfo.buttons.length; i++) {
        if (this.state.pageInfo.buttons[i].mode === this.props.query.mode) {
          btnInfo = this.state.pageInfo.buttons[i];
          break;
        }
      }
    }
    if (btnInfo) {
      try {
        if (btnInfo.type === 'submit' && btnInfo.action === 'api') {
          this.setState({ submitted: true })
          if (this.formRef) {
            let error = this.formRef.checkError();
            if (error.stt > 0) return helper.toastError(error.message || `Invalid data, Check field ${this.state.pageInfo.schema[error].name} please!`);
          }
        }
        let data = Object.assign({}, this.state.data);
        if (btnInfo.confirm) {
          let confirmText = btnInfo.confirm;
          for (var f in data) {
            confirmText = helper.replaceAll(confirmText, '#' + f + '#', data[f]);
          }
          let rs = await helper.confirm(confirmText);
          if (!rs) return;
        }
        if (this.props.query.embed && btnInfo.embedUrl) {
          let embed = helper.parseQueryData(this.props.query.embed)
          if (embed) {
            data = Object.assign({}, data, JSON.parse(this.props.query.embed));
          }
        }

        for (let index = 0; index < this.state.pageInfo.schema.length; index++) {
          const schema = this.state.pageInfo.schema[index];
          if (schema.type === 'string' && !data[schema.field]) {
            data[schema.field] = '';
          }
          if (schema.type === 'boolean' && data[schema.field] === null) {
            data[schema.field] = undefined;
          }
          if (schema.type === 'number' && (data[schema.field] === null || data[schema.field] === undefined)) {
            data[schema.field] = undefined;
            if (schema.widget === 'SingleModel') {
              data[schema.field] = (+schema.default) || 0;
            }
            if (schema.widget === 'ArrayModel') { data[schema.field] = []; }
          }
        }
        let submitData = Object.assign({}, data);

        if (btnInfo.apiData) {
          try {
            let tmpApiData = JSON.parse(btnInfo.apiData)
            for (const key in tmpApiData) {
              if (tmpApiData.hasOwnProperty(key)) {
                const e = tmpApiData[key];
                submitData[key] = helper.getFieldReferValue(e, data);
              }
            }
          } catch (error) {
            console.error(error);
            return helper.alert("Đã có lỗi xảy ra, xin vui lòng liên hệ đội phát triển để kiểm tra lại");
          }
        }
        switch (btnInfo.action) {
          case 'api':
            this.setState({ loading: true });
            let response = await helper.callPageApi(this.state.pageInfo, btnInfo.api, submitData);
            if (response.open_url) {
              window.open(response.open_url, response.target || "_self", 'noreferrer');
              this.setState({ loading: false })
              if (response.target !== "_blank") {
                return;
              }
            } else {
              this.setState({ loading: false })
              helper.alert(response.message || 'Success');
            }

            if (btnInfo.backOnDone) {
              if (btnInfo.backOnDoneHref) {
                return window.location.href = btnInfo.backOnDoneHref
              }
              return this.props.openType !== 'modal' ? window.history.back() : this.props.closeModal();
            }
            this.loadData();
            break;
          case 'report':
            this.setState({ loading: true })
            await helper.report(this.state.pageInfo, btnInfo.api, submitData, btnInfo.reportName || 'report');
            this.setState({ loading: false })
            break;
          case 'formModal':
            let raw = btnInfo.modalQuery;
            for (i in submitData) {
              raw = helper.replaceAll(raw, '#' + i + '#', submitData[i]);
            }
            let query = JSON.parse(raw);
            if (!query.modalType) query.modalType = 'form';
            var currentModal = FormCtrl;
            switch (query.modalType) {
              case 'form':
              default:
                currentModal = FormCtrl;
                break;
            }
            this.setState({ isShowModal: true, modalQuery: query, currentModal });
            break;
          case 'listModal':
            let raw1 = btnInfo.modalQuery;
            for (i in data) {
              raw1 = helper.replaceAll(raw1, '#' + i + '#', data[i]);
            }
            let query1 = JSON.parse(raw1);
            // if (!query1.modalType) query1.modalType = 'form';
            var currentModal = ListCtrl;
            this.setState({ isShowModal: true, modalQuery: query1, currentModal });
            break;

          default: break;
        }


      } catch (err) {
        helper.alert(err.message);
      }

    } else {
      helper.alert('Không có nút bấm');
    }
  }
  closeModal() {
    this.loadData().then(v => {
      this.setState({ isShowModal: false });
      setTimeout(() => {
        document.body.classList.add('modal-open');
      }, 100);
    })
  }
  render() {
    if (!this.state.data) return <Loader />;
    if (this.state.error) return (<p className='text-danger'>{this.state.error}</p>)
    if (!this.state.pageInfo) return null;
    return (<Row>
      <Col md='12'>
        <Modal
          isOpen={this.state.isShowModal || false}
          fade={false}
          size={'lg'}
          backdrop={false}
        // toggle={() => {
        //     // this.fetchData(this.state.tbl);
        //     console.log({toggle:1})
        //     this.loadData();
        //     this.setState({ isShowModal: false })
        // }}
        >
          <ModalBody>
            {this.state.currentModal && this.state.isShowModal ?
              <this.state.currentModal query={this.state.modalQuery} openType='modal' closeModal={this.closeModal.bind(this)} /> :
              <Loader />}
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => {
                this.closeModal()
              }}>Close</Button>
          </ModalFooter>
        </Modal>
        <CardGroup>
          <Card>
            <CardHeader>
              <div className='pull-left'>
                <h3 className='mb-0'>
                  {this.query.name ? this.query.name : this.state.pageInfo.name}
                </h3>
              </div>
              <div className='pull-right'>
                {this.state.pageInfo.buttons.map((item, index) => {
                  if (item.showOnTop && this.state.mode === item.mode && !helper.checkHideExpression(item.hideExpression, this.state.data)) {
                    let url = '';
                    var i = 0;
                    let btnClass = `btn-white-space btn-${item.outline ? 'outline-' : ''}${item.color}`
                    switch (item.action) {
                      case 'url':
                        url = item.url.replace('$', this.state.data);
                        for (i in this.state.data) {
                          url = helper.replaceAll(url, '#' + i + '#', this.state.data[i]);
                        }
                        for (i in this.query) {
                          url = helper.replaceAll(url, '@' + i + '@', this.props.query[i]);
                        }
                        return <a key={index} href={url} className={`btn ${btnClass} mr-1`} target={item.target || '_self'}><i className={item.icon} /> {item.title}</a>
                      case 'api':
                      case 'formModal':
                      case 'report':
                        return <Button key={index} className={`mr-1 btn-white-space`} outline={item.outline || false} color={item.color} onClick={() => { this.onButtonClick(item) }} ><i className={item.icon} /> {item.title}</Button>
                      //     url = item.url.replace('$', this.state.data);
                      //     for (i in this.state.data) {
                      //         url = helper.replaceAll(url, '#' + i + '#', this.state.data[i]);
                      //     }
                      //     for (i in this.query) {
                      //         url = helper.replaceAll(url, '@' + i + '@', this.props.query[i]);
                      //     }
                      //     url += '&accesstoken=' + Local.get('session');
                      //     return <a key={index} href={url} className={`btn ${btnClass} mr-1`}><i className={item.icon} /> {item.title}</a>
                      default:
                        return null;
                    }
                  }
                  return null;
                })}
              </div>
            </CardHeader>
            <CardBody>
              <FormSchema
                ref={ref => { this.formRef = ref; }}
                schema={this.state.pageInfo.schema}
                mode={this.props.query.mode}
                data={this.state.data || {}}
                onChange={data => {
                  this.setState({ data, submitted: false })
                }}
                submitted={this.state.submitted || false}
                onSubmit={this.onSubmit.bind(this)}>
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  {this.state.pageInfo.buttons.map((item, index) => {
                    if (!item.showOnTop && this.state.mode === item.mode && !helper.checkHideExpression(item.hideExpression, this.state.data)) {
                      let url = '';
                      var i = 0;
                      let btnClass = `btn-white-space btn-${item.outline ? 'outline-' : ''}${item.color}`
                      switch (item.action) {
                        case 'url':
                          url = item.url.replace('$', this.state.data);
                          for (i in this.state.data) {
                            url = helper.replaceAll(url, '#' + i + '#', this.state.data[i]);
                          }
                          for (i in this.query) {
                            url = helper.replaceAll(url, '@' + i + '@', this.props.query[i]);
                          }
                          return <a key={index} href={url} className={`btn ${btnClass} mr-1`} target={item.target || '_self'}><i className={item.icon} /> {item.title}</a>
                        case 'api':
                        case 'formModal':
                        case 'report':
                          return <Button key={index} className='mr-1 btn-white-space' outline={item.outline || false} color={item.color} onClick={() => { this.onButtonClick(item) }} ><i className={item.icon} /> {item.title}</Button>
                        // url = item.url.replace('$', this.state.data);
                        // for (i in this.state.data) {
                        //     url = helper.replaceAll(url, '#' + i + '#', this.state.data[i]);
                        // }
                        // for (i in this.query) {
                        //     url = helper.replaceAll(url, '@' + i + '@', this.props.query[i]);
                        // }
                        // url += `&${qs.stringify()}`;
                        // return <Button key={index} className='mr-1' outline={item.outline || false} color={item.color} onClick={() => { this.onButtonClick(item) }} ><i className={item.icon} /> {item.title}</Button>
                        // return <a key={index} href={url} className={`btn ${btnClass} mr-1`}><i className={item.icon} /> {item.title}</a>
                        default:
                          return null;
                      }
                    }
                    return null;
                  })}
                </div>

              </FormSchema>
            </CardBody>
          </Card>
        </CardGroup>

      </Col>
    </Row>


    );
  }
}
