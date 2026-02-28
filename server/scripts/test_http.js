import http from 'http';

const postData = JSON.stringify({
    messages: [
        { role: 'user', content: '양자의학에서 파동은 어떻게 설명되나요?' }
    ],
    scanData: {
        score: 85,
        dimension: "12D",
        analysis: "Test Analysis"
    }
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
