// Vercel Serverless Function for D-ID Presenters
const fetch = require('node-fetch');
const aws4 = require('aws4');

// Get API key from environment variables
const DID_API_KEY = process.env.DID_API_KEY || 'bWFiZGVsbmFzZXIxNzE3QGdtYWlsLmNvbQ:CZjkw80kd5V00wgq3G8-E';

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            // Get presenters
            const [awsAccessKey, awsSecretKey] = DID_API_KEY.split(':');
            
            const requestOptions = {
                host: 'api.d-id.com',
                path: '/presenters',
                method: 'GET',
                service: 'execute-api',
                region: 'us-east-1',
                headers: {}
            };
            
            const signed = aws4.sign(requestOptions, {
                accessKeyId: awsAccessKey,
                secretAccessKey: awsSecretKey
            });
            
            const response = await fetch('https://api.d-id.com/presenters', {
                method: 'GET',
                headers: signed.headers
            });
            
            const responseText = await response.text();
            let data;
            
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response:', responseText);
                return res.status(500).json({
                    error: 'خطأ في تحليل الرد من D-ID API',
                    message: responseText.substring(0, 200)
                });
            }
            
            if (!response.ok) {
                return res.status(response.status).json({
                    error: 'خطأ من D-ID API',
                    message: data.error || data.message || responseText
                });
            }
            
            return res.json(data);
            
        } else if (req.method === 'POST') {
            // Create presenter
            const { imageUrl } = req.body;
            
            if (!imageUrl) {
                return res.status(400).json({ error: 'رابط الصورة مطلوب' });
            }
            
            const [awsAccessKey, awsSecretKey] = DID_API_KEY.split(':');
            
            const requestOptions = {
                host: 'api.d-id.com',
                path: '/presenters',
                method: 'POST',
                service: 'execute-api',
                region: 'us-east-1',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image_url: imageUrl
                })
            };
            
            const signed = aws4.sign(requestOptions, {
                accessKeyId: awsAccessKey,
                secretAccessKey: awsSecretKey
            });
            
            const response = await fetch('https://api.d-id.com/presenters', {
                method: 'POST',
                headers: signed.headers,
                body: JSON.stringify({
                    image_url: imageUrl
                })
            });
            
            const responseText = await response.text();
            let data;
            
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response:', responseText);
                return res.status(500).json({
                    error: 'خطأ في تحليل الرد من D-ID API',
                    message: responseText.substring(0, 200)
                });
            }
            
            if (!response.ok) {
                return res.status(response.status).json({
                    error: 'خطأ من D-ID API',
                    message: data.error || data.message || responseText
                });
            }
            
            return res.json(data);
            
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Error with presenters:', error);
        return res.status(500).json({
            error: 'خطأ في العملية',
            message: error.message
        });
    }
};

