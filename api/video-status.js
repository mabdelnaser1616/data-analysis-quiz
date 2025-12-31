// Vercel Serverless Function for D-ID Video Status Check
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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { videoId } = req.query;
        
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID مطلوب' });
        }
        
        const [awsAccessKey, awsSecretKey] = DID_API_KEY.split(':');
        
        // Create AWS Signature V4 headers for GET request
        const requestOptions = {
            host: 'api.d-id.com',
            path: `/talks/${videoId}`,
            method: 'GET',
            service: 'execute-api',
            region: 'us-east-1',
            headers: {}
        };
        
        const signed = aws4.sign(requestOptions, {
            accessKeyId: awsAccessKey,
            secretAccessKey: awsSecretKey
        });
        
        const response = await fetch(`https://api.d-id.com/talks/${videoId}`, {
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
        
    } catch (error) {
        console.error('Status check error:', error);
        return res.status(500).json({
            error: 'خطأ في التحقق من حالة الفيديو',
            message: error.message
        });
    }
};

