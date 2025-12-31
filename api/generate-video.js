// Vercel Serverless Function for D-ID Video Generation
const fetch = require('node-fetch');
const aws4 = require('aws4');

// Get API keys from environment variables
const DID_API_KEY = process.env.DID_API_KEY || 'bWFiZGVsbmFzZXIxNzE3QGdtYWlsLmNvbQ:CZjkw80kd5V00wgq3G8-E';
const DID_PRESENTER_ID = process.env.DID_PRESENTER_ID || 'amy-jcwCkr1grs';
const DID_SOURCE_URL = process.env.DID_SOURCE_URL || 'https://i.postimg.cc/LXjJtfd8/5.jpg';
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 's83SAGdFTflAwJcAV81K';

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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'النص مطلوب' });
        }
        
        // D-ID API uses AWS Signature V4 for authentication
        const [awsAccessKey, awsSecretKey] = DID_API_KEY.split(':');
        
        // Function to create AWS Signature V4 headers
        const createAWSSignedHeaders = (requestBody) => {
            const bodyString = JSON.stringify(requestBody);
            const requestOptions = {
                host: 'api.d-id.com',
                path: '/talks',
                method: 'POST',
                service: 'execute-api',
                region: 'us-east-1',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(bodyString)
                },
                body: bodyString
            };
            
            const signed = aws4.sign(requestOptions, {
                accessKeyId: awsAccessKey,
                secretAccessKey: awsSecretKey
            });
            
            return signed.headers;
        };
        
        // Try different auth methods
        const authMethods = [
            // Method 1: AWS Signature V4
            (body) => createAWSSignedHeaders(body),
            // Method 2: Basic Auth
            () => ({
                'Authorization': `Basic ${Buffer.from(DID_API_KEY).toString('base64')}`
            }),
            // Method 3: X-API-Key
            () => ({
                'X-API-Key': DID_API_KEY
            }),
            // Method 4: Bearer
            () => ({
                'Authorization': `Bearer ${DID_API_KEY}`
            })
        ];
        
        // Try different request formats
        const requestBodies = [
            {
                source_url: DID_SOURCE_URL || `https://d-id-public-bucket.s3.amazonaws.com/${DID_PRESENTER_ID}.jpg`,
                script: {
                    type: 'text',
                    input: text,
                    provider: {
                        type: 'elevenlabs',
                        voice_id: ELEVENLABS_VOICE_ID,
                        voice_config: {
                            stability: 0.5,
                            similarity_boost: 0.75
                        }
                    }
                },
                config: {
                    result_format: 'mp4'
                }
            },
            {
                source_url: DID_SOURCE_URL || `https://d-id-public-bucket.s3.amazonaws.com/${DID_PRESENTER_ID}.jpg`,
                script: {
                    type: 'text',
                    input: text,
                    provider: {
                        type: 'elevenlabs',
                        voice_id: ELEVENLABS_VOICE_ID
                    }
                },
                config: {
                    result_format: 'mp4'
                }
            }
        ];
        
        let lastError = null;
        
        // Try all combinations
        for (let authIndex = 0; authIndex < authMethods.length; authIndex++) {
            for (let formatIndex = 0; formatIndex < requestBodies.length; formatIndex++) {
                const requestBody = requestBodies[formatIndex];
                
                try {
                    const authHeaders = authMethods[authIndex](requestBody);
                    const headers = {
                        'Content-Type': 'application/json',
                        ...authHeaders
                    };
                    
                    const response = await fetch('https://api.d-id.com/talks', {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(requestBody)
                    });
                
                    const responseText = await response.text();
                    let responseData;
                    
                    try {
                        responseData = JSON.parse(responseText);
                    } catch (e) {
                        responseData = { raw: responseText };
                    }
                    
                    if (response.ok && responseData.id) {
                        return res.json({
                            success: true,
                            video_id: responseData.id,
                            status_url: responseData.status_url || `https://api.d-id.com/talks/${responseData.id}`,
                            data: responseData,
                            auth_used: authIndex + 1,
                            format_used: formatIndex + 1
                        });
                    } else if (response.status === 401 || response.status === 403) {
                        break;
                    } else if (response.status === 500 && formatIndex < requestBodies.length - 1) {
                        continue;
                    } else {
                        lastError = {
                            auth: authIndex + 1,
                            format: formatIndex + 1,
                            status: response.status,
                            error: responseData.error || responseData.message || responseData.description,
                            data: responseData
                        };
                        break;
                    }
                } catch (error) {
                    lastError = {
                        auth: authIndex + 1,
                        format: formatIndex + 1,
                        error: error.message
                    };
                    continue;
                }
            }
        }
        
        return res.status(500).json({
            success: false,
            error: 'فشل إنشاء الفيديو',
            message: 'جميع صيغ الطلب فشلت',
            last_error: lastError
        });
        
    } catch (error) {
        console.error('Error generating video:', error);
        return res.status(500).json({
            error: 'خطأ في إنشاء الفيديو',
            message: error.message
        });
    }
};

