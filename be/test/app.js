let host = "http://localhost:1337";
// let host = "http://viettelbackend.mpoint.vn";
// let host = 'https://171.244.149.206:8010';
let expect = chai.expect;
chai.use(chaiHttp);
mocha.setup('bdd');
mocha.setup({
    timeout: 50000
})
var merchantCode = '';
let token = 'customer';
let shopToken = 'shop';
let partnerToken = 'partner';
//create session ok a47b871e-477f-461c-9c78-be1397233273
let merchantToken = 'a47b871e-477f-461c-9c78-be1397233273';
let sourceToken = 'd660d0d9-7955-48d9-ab3b-f8f2f95348e2'
// describe('Source', () => {
//     it('/api/source/sync-voucher', done => {
//         chai.request(host)
//             .post('/api/source/sync-voucher')
//             .send({
//                 partner: 1,
//                 condition: 1,
//                 category: 1,
//                 codeType: 3,
//                 checkout: 1,
//                 voucherId: 1
//             })
//             .set('Authorization', `Basic ${sourceToken}`)
//             .set('Accept-Language', `vi`)
//             .end((err, res) => {
//                 console.log(res);
//                 expect(res.status).be.equal(200);
//                 expect(res.body.code).be.equal(0);
//                 done();
//             })
//     })
// }
// )
describe('Voucher', () => {
    it('/api/meta/get-all-provinces', done => {
        chai.request(host)
            .post('/api/meta/get-all-provinces')
            .send({
            })
            .set('Authorization', `Bearer ${token}`)
            .set('Accept-Language', `vi`)
            .end((err, res) => {
                console.log(res);
                expect(res.status).be.equal(200);
                expect(res.body.code).be.equal(0);
                done();
            })
    })
    it('/api/keyword/find-keyword', done => {
        chai.request(host)
            .post('/api/keyword/find-keyword')
            .send({
            })
            .set('Authorization', `Bearer ${token}`)
            .set('Accept-Language', `vi`)
            .end((err, res) => {
                console.log(res);
                expect(res.status).be.equal(200);
                expect(res.body.code).be.equal(0);
                done();
            })
    })
    it('/api/voucher/get-home-data', done => {
        chai.request(host)
            .post('/api/voucher/get-home-data')
            .send({
                phone: '961105256'
            })
            .set('Authorization', `Bearer ${token}`)
            .set('Accept-Language', `vi`)
            .end((err, res) => {
                console.log(res);
                expect(res.status).be.equal(200);
                expect(res.body.code).be.equal(0);
                done();
            })
    })
    it('/api/voucher/get-list-vouchers', done => {
        chai.request(host)
            .post('/api/voucher/get-list-vouchers')
            .send({
                skip: 0, limit: 1, category: 1
            })
            .set('Authorization', `Bearer ${token}`)
            .set('Accept-Language', `vi`)
            .end((err, res) => {
                console.log(res);
                expect(res.status).be.equal(200);
                expect(res.body.code).be.equal(0);
                done();
            })
    })

    it('/api/voucher/get-voucher-info', done => {
        chai.request(host)
            .post('/api/voucher/get-voucher-info')
            .send({
                voucher: 5, phone: '968292392'
            })
            .set('Authorization', `Bearer ${token}`)
            .set('Accept-Language', `vi`)
            .end((err, res) => {
                console.log(res);
                expect(res.status).be.equal(200);
                expect(res.body.code).be.equal(0);
                done();
            })
    })
    it('/api/code/get-customer-codes', done => {
        chai.request(host)
            .post('/api/code/get-customer-codes')
            .send({
                skip: 0, limit: 300, phone: '961105256'
            })
            .set('Authorization', `Bearer ${token}`)
            .set('Accept-Language', `vi`)
            .end((err, res) => {
                console.log(res);
                expect(res.status).be.equal(200);
                expect(res.body.code).be.equal(0);
                done();
            })
    })
    it('/api/voucher/like', done => {
        chai.request(host)
            .post('/api/voucher/like')
            .send({
                voucher: 1, phone: '961105256'
            })
            .set('Authorization', `Bearer ${token}`)
            .set('Accept-Language', `vi`)
            .end((err, res) => {
                console.log(res);
                expect(res.status).be.equal(200);
                expect(res.body.code).be.equal(0);
                done();
            })
    })
    it('/api/voucher/rate', done => {
        chai.request(host)
            .post('/api/voucher/rate')
            .send({
                voucher: 1, phone: '961105256', rate: 5
            })
            .set('Authorization', `Bearer ${token}`)
            .set('Accept-Language', `vi`)
            .end((err, res) => {
                console.log(res);
                expect(res.status).be.equal(200);
                expect(res.body.code).be.equal(0);
                done();
            })
    })
    it('/api/voucher/get-code', done => {
        chai.request(host)
            .post('/api/voucher/get-code')
            .send({
                voucher: 11,
                phone: '961105256'
            })
            .set('Authorization', `Bearer ${token}`)
            .set('Accept-Language', `vi`)
            .end((err, res) => {
                console.log(res);
                expect(res.status).be.equal(200);
                expect(res.body.code).be.equal(0);
                done();
            })
    })
})

mocha.run();