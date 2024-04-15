import _ from 'lodash';
const initialState = []
// let example = [{
//     type: 'message',
//     content: 'Thông báo gì đó',
//     show: true
// }, {
//     type: 'confirm',
//     content: 'Hỏi gì đó',
//     show: true,
//     cb: rs => {
//         if (rs === 1) {
//             console.log('Trả lời có');
//         } else {
//             console.log('Trằ lời không');
//         }
//     }
// }]
export default function (state = initialState, action) {
    let tmp = _.clone(state);
    switch (action.type) {
        case 'PUSH_MODAL':
            action.data.show = true;
            action.data.id = _.uniqueId();
            tmp.push(action.data);
            return tmp;
        case 'POP_MODAL':
            for (let i = 0; i < tmp.length; i++) {
                if (tmp[i].id === action.data.id) {
                    tmp[i].show = false;
                    tmp.splice(i, 1);
                }
            }
            return tmp;
        case 'HIDE_MODAL':
            for (let i = 0; i < tmp.length; i++) {
                if (tmp[i].id === action.data.id) {
                    tmp[i].show = false;
                }
            }
            return tmp;
        default:
            return state;
    }
}