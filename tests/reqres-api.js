import http from 'k6/http';
import { sleep } from 'k6';
import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.2/index.js';
import { BASE_URL, HEADERS } from './config.js';

// Load JSON data
const data = JSON.parse(open('./data.json'));

export const options = {
    thresholds: {
        checks: [{ threshold: 'rate == 1.00', abortOnFail: false }],
        http_req_duration: ['p(95)<10000'],
    },
    iterations: 1,
};

// Utility function to send requests
function sendRequest(method, endpoint, body = null) {
    let res;
    if (body) {
        res = http[method](`${BASE_URL}${endpoint}`, JSON.stringify(body), { headers: HEADERS });
    } else {
        res = http[method](`${BASE_URL}${endpoint}`);
    }
    return res;
}

export default function () {
    describe('List Users', () => {
        const res = sendRequest('get', '/users');
        expect(res.status).to.equal(200);
    });

    describe('Single User', () => {
        const res = sendRequest('get', '/users/2');
        expect(res.status).to.equal(200);
    });

    describe('Single User Not Found', () => {
        const res = sendRequest('get', '/users/23');
        expect(res.status).to.equal(404);
    });

    describe('Create User', () => {
        const res = sendRequest('post', '/users', data.createUser);
        expect(res.status).to.equal(201);
    });

    describe('Update User', () => {
        const res = sendRequest('put', '/users/2', data.updateUser);
        expect(res.status).to.equal(200);
    });

    describe('Delete User', () => {
        const res = sendRequest('del', '/users/2');
        expect(res.status).to.equal(204);
    });

    describe('List Resource', () => {
        const res = sendRequest('get', '/unknown');
        expect(res.status).to.equal(200);
    });

    describe('Single Resource', () => {
        const res = sendRequest('get', '/unknown/2');
        expect(res.status).to.equal(200);
    });

    describe('Single Resource Not Found', () => {
        const res = sendRequest('get', '/unknown/23');
        expect(res.status).to.equal(404);
    });

    describe('Register User Successful', () => {
        const res = sendRequest('post', '/register', data.registerUser);
        expect(res.status).to.equal(200);
    });

    describe('Register User Unsuccessful', () => {
        const res = sendRequest('post', '/register', data.registerUserFail);
        expect(res.status).to.equal(400);
    });

    describe('Login User Successful', () => {
        const res = sendRequest('post', '/login', data.loginUser);
        expect(res.status).to.equal(200);
    });

    describe('Login User Unsuccessful', () => {
        const res = sendRequest('post', '/login', data.loginUserFail);
        expect(res.status).to.equal(400);
    });

    sleep(1);
}
